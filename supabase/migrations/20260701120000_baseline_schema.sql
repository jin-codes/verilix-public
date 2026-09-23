-- Baseline: 원격 DB에 이미 생성되어 있던 전체 스키마를 마이그레이션 히스토리에 반영한다.
-- (docker 없이 `supabase db pull`을 쓸 수 없어 information_schema/pg_catalog 조회 결과를 그대로 옮김)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  type_a_context text,
  type_a_updated_at timestamptz,
  ui_language text default 'en',
  ai_response_language text default 'en',
  doc_language text default 'en',
  plan text default 'free' check (plan in ('free', 'basic', 'pro')),
  credits_total integer default 100,
  credits_used integer default 0,
  knowledge_mode text default 'all' check (knowledge_mode in ('all', 'type_a_only', 'off')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "본인만" on public.profiles for all using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- folders
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.folders enable row level security;
create policy "본인만" on public.folders for all using (auth.uid() = user_id);

-- conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'New Conversation',
  model text default 'claude-haiku-4-5',
  model_mode text default 'auto' check (model_mode in ('auto', 'manual', 'deep')),
  knowledge_mode text default 'all' check (knowledge_mode in ('all', 'type_a_only', 'off')),
  is_documented boolean default false,
  document_id uuid,
  total_tokens integer default 0,
  cached_tokens integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "본인만" on public.conversations for all using (auth.uid() = user_id);

-- messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  content_compressed text,
  model_used text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cached_tokens integer default 0,
  created_at timestamptz default now()
);

create index messages_conversation_id_idx on public.messages(conversation_id);

alter table public.messages enable row level security;
create policy "본인만" on public.messages for all using (auth.uid() = user_id);

-- documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  folder_id uuid references public.folders(id) on delete set null,
  title text not null default 'Untitled',
  summary text,
  key_conclusion text,
  learnings text,
  action_items jsonb default '[]',
  follow_up_questions jsonb default '[]',
  tags text[] default '{}',
  doc_type text default 'general' check (doc_type in ('general', 'meeting', 'spec', 'report', 'idea', 'research')),
  raw_conversation jsonb,
  embedding vector(1536),
  emotion_tone text,
  repeat_keywords text[],
  unresolved_questions jsonb default '[]',
  doc_trigger text default 'manual' check (doc_trigger in ('manual', 'auto_exit', 'auto_timer')),
  version integer default 1,
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index documents_user_id_idx on public.documents(user_id);
create index documents_embedding_idx on public.documents using ivfflat (embedding vector_cosine_ops);

alter table public.documents enable row level security;
create policy "본인만" on public.documents for all using (auth.uid() = user_id);

alter table public.conversations
  add constraint fk_document foreign key (document_id) references public.documents(id) on delete set null;

-- credit_logs
create table public.credit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  action text not null,
  model_used text,
  credits_used numeric not null,
  tokens_input integer,
  tokens_output integer,
  tokens_cached integer,
  created_at timestamptz default now()
);

create index credit_logs_user_id_idx on public.credit_logs(user_id);

alter table public.credit_logs enable row level security;
create policy "본인만" on public.credit_logs for all using (auth.uid() = user_id);

-- document_versions
create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_at timestamptz default now()
);

create index document_versions_document_id_idx on public.document_versions(document_id);

alter table public.document_versions enable row level security;
create policy "본인만" on public.document_versions for all using (auth.uid() = user_id);

-- self_model
create table public.self_model (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  decision_style text,
  risk_appetite text,
  core_values jsonb default '[]',
  interest_clusters jsonb default '[]',
  writing_tone text,
  version integer default 1,
  previous_snapshot jsonb,
  agent_permission_level text default 'low' check (agent_permission_level in ('low', 'medium', 'high', 'max')),
  last_analyzed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.self_model enable row level security;
create policy "본인만" on public.self_model for all using (auth.uid() = user_id);

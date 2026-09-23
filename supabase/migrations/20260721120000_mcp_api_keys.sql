-- mcp_api_keys
create table public.mcp_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key_hash text not null unique,
  name text not null default 'API Key',
  created_at timestamptz default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index mcp_api_keys_user_id_idx on public.mcp_api_keys(user_id);

alter table public.mcp_api_keys enable row level security;
create policy "본인만" on public.mcp_api_keys for all using (auth.uid() = user_id);

-- mcp_usage_logs
create table public.mcp_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  api_key_id uuid references public.mcp_api_keys(id) on delete set null,
  tool text not null check (tool in ('search_knowledge', 'save_document')),
  billed_amount numeric,
  created_at timestamptz default now()
);

create index mcp_usage_logs_user_id_idx on public.mcp_usage_logs(user_id);

alter table public.mcp_usage_logs enable row level security;
create policy "본인만" on public.mcp_usage_logs for all using (auth.uid() = user_id);

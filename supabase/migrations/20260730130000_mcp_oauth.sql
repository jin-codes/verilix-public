-- mcp_oauth_clients: Dynamic Client Registration (RFC 7591) targets, public clients only (PKCE, no secret)
create table public.mcp_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  redirect_uris text[] not null,
  client_name text,
  created_at timestamptz not null default now()
);

alter table public.mcp_oauth_clients enable row level security;
-- 클라이언트 등록 정보는 유저 소유가 아니라 서비스 전역 자원이라 authenticated/anon 직접 접근을 두지 않음, service_role만 사용

-- mcp_oauth_codes: authorization_code grant의 code (단발성, 짧은 TTL)
create table public.mcp_oauth_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  client_id text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  code_challenge_method text not null default 'S256',
  scope text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mcp_oauth_codes_user_id_idx on public.mcp_oauth_codes(user_id);

alter table public.mcp_oauth_codes enable row level security;
create policy "본인만" on public.mcp_oauth_codes for all using (auth.uid() = user_id);

-- mcp_oauth_tokens: token 교환 결과 (access + refresh). mcp_api_keys와 별개 테이블로 두되
-- withMcpAuth 검증 시 두 테이블을 함께 조회해 어느 쪽 토큰이든 인증되도록 함(src/mcp/auth.ts)
create table public.mcp_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  access_token_hash text not null unique,
  refresh_token_hash text unique,
  client_id text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index mcp_oauth_tokens_user_id_idx on public.mcp_oauth_tokens(user_id);

alter table public.mcp_oauth_tokens enable row level security;
create policy "본인만" on public.mcp_oauth_tokens for all using (auth.uid() = user_id);

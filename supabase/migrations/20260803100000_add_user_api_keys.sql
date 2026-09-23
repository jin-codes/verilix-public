-- BYOK(Bring Your Own Key). 유저가 자기 소유의 OpenAI/Anthropic/Google API 키를 등록해두는 테이블.
-- mcp_api_keys(해시만 저장, 검증 전용)와 달리 이 키는 실제로 외부 API 호출에 다시 써야 하므로
-- 되돌릴 수 있는 암호화(AES-256-GCM, src/lib/ai/byok.ts)로 저장한다 — 원문은 여기 저장되지 않는다.
-- 프로바이더당 유저 1행만 유지(unique) — 여러 개 발급/폐기 이력을 남기는 mcp_api_keys와 달리
-- "지금 등록된 키가 무엇인지"만 관리하면 되는 단순한 슬롯이라 upsert로 갱신한다.
create table public.user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'google')),
  encrypted_key text not null,
  key_preview text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index user_api_keys_user_id_idx on public.user_api_keys(user_id);

alter table public.user_api_keys enable row level security;
create policy "본인만" on public.user_api_keys for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

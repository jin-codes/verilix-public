-- 채팅 응답 AI가 <!--VLX:TYPE payload--> 히든 태그로 남기는 부가 신호를 저장하는 테이블 2개.
-- NOTE: 유저가 당장 볼 필요 없는 자유 메모. 본인은 나중에 조회 가능(향후 UI에서 노출 예정).
create table public.assistant_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.assistant_notes enable row level security;
create policy "본인만" on public.assistant_notes for all using (auth.uid() = user_id);

-- ALERT: 불법/문제 행위 감지 등 개발자 전용 경고. 유저 본인은 절대 조회 불가(select/update/delete
-- 정책을 두지 않음 — RLS가 기본 거부하므로 anon/authenticated GRANT가 있어도 막힘). 등록만 본인 명의로 가능.
create table public.security_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  content text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.security_alerts enable row level security;
create policy "본인 등록만" on public.security_alerts for insert with check (auth.uid() = user_id);

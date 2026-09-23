-- DEV_COMMENT: 채팅 답변 AI가 개발자에게 자유롭게(제약된 트리거 없이, AI 재량으로) 남기는 코멘트.
-- ALERT(보안 의심 행동 한정)/LOW_CONFIDENCE·FEEDBACK_SIGNAL(응답 품질 한정)과 달리 범위를 좁히지
-- 않는다 — 버그로 보이는 것, 프롬프트/시스템 동작에 대한 관찰, 기능 제안 등 무엇이든 대상.
-- quality_signals와 동일한 패턴: 등록은 본인 명의로만, 조회는 유저 본인에게도 열지 않고 관리자만.
create table public.dev_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.dev_comments enable row level security;

create policy "본인 등록만" on public.dev_comments for insert with check (auth.uid() = user_id);

create policy "관리자 조회" on public.dev_comments for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자 리뷰 처리" on public.dev_comments for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 관리자 대시보드에서 "누가, 어떤 대화에서" 남겼는지 보여주기 위한 조인 함수.
-- admin_security_alerts()/admin_quality_signals()와 동일한 이유로 service_role 전용.
create or replace function public.admin_dev_comments()
returns table (
  id uuid,
  user_id uuid,
  user_email text,
  conversation_id uuid,
  conversation_title text,
  content text,
  reviewed boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    dc.id,
    dc.user_id,
    p.email as user_email,
    dc.conversation_id,
    c.title as conversation_title,
    dc.content,
    dc.reviewed,
    dc.created_at
  from public.dev_comments dc
  left join public.profiles p on p.id = dc.user_id
  left join public.conversations c on c.id = dc.conversation_id
  order by dc.created_at desc;
$$;

revoke execute on function public.admin_dev_comments() from public;
grant execute on function public.admin_dev_comments() to service_role;

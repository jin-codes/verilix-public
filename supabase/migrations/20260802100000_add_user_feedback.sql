-- 유저가 직접 작성해 개발자에게 보내는 피드백. DEV_COMMENT(채팅 AI가 재량으로 남기는 관찰)와 달리
-- 유저 본인이 명시적으로 입력한 내용이므로, 등록은 본인 명의로만 가능하되 조회는 dev_comments와
-- 동일하게 관리자 전용으로 둔다(유저 본인이 보낸 걸 다시 조회하는 화면은 이번 범위 밖).
create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_feedback enable row level security;

create policy "본인 등록만" on public.user_feedback for insert with check (auth.uid() = user_id);

create policy "관리자 조회" on public.user_feedback for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자 리뷰 처리" on public.user_feedback for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 관리자 대시보드에서 "누가 보냈는지"를 보여주기 위한 조인 함수.
-- admin_dev_comments() 등과 동일한 이유로 service_role 전용.
create or replace function public.admin_user_feedback()
returns table (
  id uuid,
  user_id uuid,
  user_email text,
  content text,
  reviewed boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    uf.id,
    uf.user_id,
    p.email as user_email,
    uf.content,
    uf.reviewed,
    uf.created_at
  from public.user_feedback uf
  left join public.profiles p on p.id = uf.user_id
  order by uf.created_at desc;
$$;

revoke execute on function public.admin_user_feedback() from public;
grant execute on function public.admin_user_feedback() to service_role;

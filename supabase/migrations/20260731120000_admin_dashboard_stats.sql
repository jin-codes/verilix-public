-- 관리자 대시보드(개발자 전용, /admin)용 유저 현황 집계 함수.
-- profiles/conversations/documents는 전부 "본인만" RLS라 일반 클라이언트로는 전체 유저를 조회할 수 없다.
-- service_role 키로만 호출하는 것을 전제로 하므로(RLS는 service_role엔 원래 적용 안 됨),
-- security definer 자체가 보안 경계가 아니라 "혹시 anon/authenticated가 rpc로 직접 불러도 안전하게"
-- 만드는 게 목적 — 그래서 execute 권한을 public/anon/authenticated에서 명시적으로 걷어내고
-- service_role에만 부여한다.
create or replace function public.admin_user_stats()
returns table (
  id uuid,
  email text,
  display_name text,
  plan text,
  is_admin boolean,
  credits_total integer,
  credits_used integer,
  credits_reset_at date,
  created_at timestamptz,
  conversation_count bigint,
  document_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.display_name,
    p.plan,
    p.is_admin,
    p.credits_total,
    p.credits_used,
    p.credits_reset_at,
    p.created_at,
    coalesce(c.cnt, 0) as conversation_count,
    coalesce(d.cnt, 0) as document_count
  from public.profiles p
  left join (select user_id, count(*) as cnt from public.conversations group by user_id) c on c.user_id = p.id
  left join (select user_id, count(*) as cnt from public.documents group by user_id) d on d.user_id = p.id
  order by p.created_at desc;
$$;

revoke execute on function public.admin_user_stats() from public;
grant execute on function public.admin_user_stats() to service_role;

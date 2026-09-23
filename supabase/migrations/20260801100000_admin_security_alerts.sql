-- 관리자 대시보드 확장: ALERT가 "누가, 어떤 대화에서" 발생했는지 알 수 있도록
-- security_alerts를 profiles(email)/conversations(title)와 조인해 반환하는 함수.
-- admin_user_stats()와 동일한 이유로 service_role 전용 — conversations는 "본인만 조회" RLS라
-- 일반 admin 세션 클라이언트로는 다른 유저의 대화 제목을 읽을 수 없으므로 RLS를 넓히는 대신
-- 서버 전용 service-role 클라이언트로 조인해서 내려준다. security_alerts 자체는 이미
-- "관리자 조회"/"관리자 리뷰 처리" RLS 정책이 있어 리뷰 처리(update)는 기존처럼 admin 세션
-- 클라이언트로 바로 처리한다(admin-alert-bell.tsx와 동일 패턴) — 이 함수는 읽기 전용 조인용.
create or replace function public.admin_security_alerts()
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
    sa.id,
    sa.user_id,
    p.email as user_email,
    sa.conversation_id,
    c.title as conversation_title,
    sa.content,
    sa.reviewed,
    sa.created_at
  from public.security_alerts sa
  left join public.profiles p on p.id = sa.user_id
  left join public.conversations c on c.id = sa.conversation_id
  order by sa.created_at desc;
$$;

revoke execute on function public.admin_security_alerts() from public;
grant execute on function public.admin_security_alerts() to service_role;

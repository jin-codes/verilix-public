-- quality_signals: security_alerts와 동일한 패턴으로 관리자 조회/리뷰 처리를 연다.
-- 지금까지는 유저 본인도 관리자도 앱에서 조회할 방법이 전혀 없었음(insert-only RLS,
-- service_role로만 조회 가능 — 20260730110000의 주석 "admin UI는 아직 없음" 참고, 이제 추가함).
create policy "관리자 조회" on public.quality_signals for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "관리자 리뷰 처리" on public.quality_signals for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- 관리자 대시보드에서 "누가, 어떤 대화에서" 신호가 발생했는지 보여주기 위한 조인 함수.
-- conversations는 여전히 "본인만 조회" RLS라 admin 세션 클라이언트로는 제목을 못 읽으므로
-- admin_security_alerts()와 동일한 이유로 service_role 조인이 필요.
create or replace function public.admin_quality_signals()
returns table (
  id uuid,
  user_id uuid,
  user_email text,
  conversation_id uuid,
  conversation_title text,
  signal_type text,
  content text,
  reviewed boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    qs.id,
    qs.user_id,
    p.email as user_email,
    qs.conversation_id,
    c.title as conversation_title,
    qs.signal_type,
    qs.content,
    qs.reviewed,
    qs.created_at
  from public.quality_signals qs
  left join public.profiles p on p.id = qs.user_id
  left join public.conversations c on c.id = qs.conversation_id
  order by qs.created_at desc;
$$;

revoke execute on function public.admin_quality_signals() from public;
grant execute on function public.admin_quality_signals() to service_role;

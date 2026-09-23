-- 보안 하드닝 (공개 레포 전환 전 점검에서 발견)
--
-- 1) 20260721140000이 `grant all on all functions ... to anon, authenticated` +
--    `alter default privileges ... grant all on functions to anon, authenticated`를 걸어뒀다.
--    이후 admin_* 함수들은 `revoke execute ... from public`만 했는데, 이건 PUBLIC 슈도롤의 권한만
--    회수할 뿐 anon/authenticated에 직접 부여된 실행 권한은 그대로다 → security definer인 admin_*
--    함수를 anon 키만으로(로그인 없이) /rest/v1/rpc/* 로 호출해 전 유저 데이터를 조회할 수 있었다.
revoke execute on function public.admin_user_stats() from anon, authenticated;
revoke execute on function public.admin_security_alerts() from anon, authenticated;
revoke execute on function public.admin_quality_signals() from anon, authenticated;
revoke execute on function public.admin_dev_comments() from anon, authenticated;
revoke execute on function public.admin_user_feedback() from anon, authenticated;

-- 앞으로 만들 함수가 자동으로 anon/authenticated에 열리지 않도록 기본 권한도 회수한다.
-- (필요한 함수는 마이그레이션에서 명시적으로 grant execute 할 것. 기존 함수의 권한은 그대로 유지됨)
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- 2) profiles RLS는 `for all using (auth.uid() = id)`에 컬럼 제한이 없고 authenticated에 UPDATE가
--    전부 열려 있어서, 로그인한 누구나 브라우저에서 본인 프로필의 is_admin/plan/credits_*를
--    직접 바꿀 수 있었다(특히 is_admin=true → /admin 전체 열람). 클라이언트 세션(anon/authenticated)이
--    민감 컬럼을 바꾸려 하면 거부하고, service_role/마이그레이션(직접 SQL)은 그대로 허용한다.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') then
    if new.is_admin is distinct from old.is_admin
       or new.plan is distinct from old.plan
       or new.credits_total is distinct from old.credits_total
       or new.credits_used is distinct from old.credits_used
       or new.credits_reset_at is distinct from old.credits_reset_at
       or new.email is distinct from old.email then
      raise exception 'not allowed to modify protected profile columns' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_columns on public.profiles;
create trigger protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

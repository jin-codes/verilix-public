-- 친구 초대/크레딧 보너스 기능 제거 (20260802110000_add_referrals.sql 되돌림).
-- 온보딩의 코드 입력란 등 프런트엔드도 함께 제거됨 — 이 마이그레이션은 그 짝.

drop function if exists public.apply_referral(text, uuid);

-- handle_new_user()를 referral_code 없이 프로필을 만들던 원래 형태로 복원
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$;

drop function if exists public.generate_referral_code();

alter table public.profiles
  drop column if exists referred_by,
  drop column if exists referral_code;

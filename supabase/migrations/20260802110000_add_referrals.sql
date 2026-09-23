-- 친구 초대 시스템: 유저마다 고유 초대 코드를 갖고, 그 코드로 가입한 신규 유저가 생기면
-- 초대한 유저·초대받은 유저 양쪽의 profiles.credits_total(하루 크레딧 한도)을 영구적으로 올려준다.
-- credits_total은 /api/chat의 일일 리셋 로직이 credits_used만 0으로 되돌리고 건드리지 않는 컬럼이라
-- (src/lib/ai/credits.ts DAILY_CREDITS=30은 profiles.credits_total의 "기본값"일 뿐, 매일 재적용되는
-- 상한이 아님) 여기 얹는 보너스가 리셋 때마다 사라지지 않고 그대로 누적된다.

alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create or replace function public.generate_referral_code()
returns text
language plpgsql
as $function$
declare
  v_code text;
  v_exists boolean;
begin
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 7));
    select exists(select 1 from public.profiles where referral_code = v_code) into v_exists;
    exit when not v_exists;
  end loop;
  return v_code;
end;
$function$;

-- 기존 유저 백필 (신규 유저는 아래 handle_new_user()가 가입 시점에 채움)
update public.profiles set referral_code = public.generate_referral_code() where referral_code is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, email, display_name, avatar_url, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    public.generate_referral_code()
  );
  return new;
end;
$function$;

-- 초대 코드로 가입을 연결하고 양쪽에 보너스를 지급하는 단일 진입점.
-- SECURITY DEFINER + auth.uid() 체크로 "본인 계정에 자기 자신을 초대받은 사람으로 연결"하는
-- 호출만 허용 — 다른 유저의 referred_by를 임의로 바꾸는 경로는 없음.
-- referred_by가 null일 때만 갱신되므로 같은 유저가 여러 번 호출해도(재시도, 중복 콜백 등)
-- 보너스가 한 번만 지급된다.
create or replace function public.apply_referral(p_referral_code text, p_referred_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_referrer_id uuid;
  v_updated_count int;
  v_bonus int := 10;
begin
  if auth.uid() is distinct from p_referred_id then
    return false;
  end if;

  select id into v_referrer_id from public.profiles where referral_code = p_referral_code;
  if v_referrer_id is null or v_referrer_id = p_referred_id then
    return false;
  end if;

  update public.profiles
    set referred_by = v_referrer_id
    where id = p_referred_id and referred_by is null;
  get diagnostics v_updated_count = row_count;
  if v_updated_count = 0 then
    return false;
  end if;

  update public.profiles set credits_total = credits_total + v_bonus where id = v_referrer_id;
  update public.profiles set credits_total = credits_total + v_bonus where id = p_referred_id;

  return true;
end;
$function$;

revoke all on function public.apply_referral(text, uuid) from public;
grant execute on function public.apply_referral(text, uuid) to authenticated;

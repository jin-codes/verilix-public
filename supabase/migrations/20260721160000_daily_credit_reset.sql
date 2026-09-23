-- 크레딧을 1일 $0.30(=30크레딧, 1크레딧=$0.01)로 조정하고 매일 자정(UTC) 기준 초기화되도록 함.
alter table public.profiles
  alter column credits_total set default 30;

alter table public.profiles
  add column credits_reset_at date not null default current_date;

update public.profiles set credits_total = 30 where credits_total = 100;

-- 크레딧을 1일 $0.20(=20크레딧, 1크레딧=$0.01)로 하향 조정.
-- MIN_CREDITS_RESERVE_HAIKU(3, src/lib/ai/credits.ts)는 항상 못 건드리는 절대 버퍼라
-- 실사용 가능한 건 20-3=17크레딧(Haiku 기본 대화 기준 하루 약 17턴 상당) — 의도된 값.
alter table public.profiles
  alter column credits_total set default 20;

-- 이미 추천 보너스(+10) 등으로 기본값 30에서 바뀐 계정은 건드리지 않고, 아직 기본값 그대로인
-- 계정만 새 기본값으로 맞춘다 (20260721160000의 100->30 전환과 동일한 패턴).
update public.profiles set credits_total = 20 where credits_total = 30;

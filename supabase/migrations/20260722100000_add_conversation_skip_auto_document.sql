-- 채팅 응답 말미에 AI가 내리는 "문서화 불필요" 판단(숨김 마커)을 저장하는 컬럼.
-- 매 턴 최신 판단으로 덮어써지며, auto_exit/auto_timer 트리거가 이 값을 보고 문서 생성을 건너뛴다.
-- manual 트리거(유저가 직접 누르는 저장 버튼)는 이 값과 무관하게 항상 실행된다.
alter table public.conversations
  add column skip_auto_document boolean not null default false;

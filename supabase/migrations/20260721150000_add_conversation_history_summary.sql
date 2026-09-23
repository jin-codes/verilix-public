-- 대화 히스토리 롤링 요약 (3턴/6메시지 넘어가는 과거 메시지를 Haiku로 요약해 컨텍스트 비용 절감)
alter table public.conversations
  add column history_summary text,
  add column history_summarized_count integer not null default 0;

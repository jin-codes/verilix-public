-- log_note: MCP 전용 신설 툴 — note(관찰 기록)/devComment(개발자 코멘트)를 save_document에서
-- 떼어내 문서 저장과 독립적으로 호출할 수 있게 함(src/mcp/tools/log-note.ts). 유저가 특징적인
-- 행동을 보이거나 개발자에게 남길 코멘트가 있을 때, 저장할 문서가 없어도 단독 호출 가능.
alter table public.mcp_usage_logs drop constraint mcp_usage_logs_tool_check;
alter table public.mcp_usage_logs add constraint mcp_usage_logs_tool_check
  check (tool in ('search_knowledge', 'save_document', 'log_note'));

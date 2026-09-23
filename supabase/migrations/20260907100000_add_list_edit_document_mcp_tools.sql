-- MCP에 문서 편집(edit_document)과 전체 목록 조회(list_documents) 툴을 추가함
-- (src/mcp/tools/list-documents.ts, edit-document.ts). 기존엔 검색으로만 문서에 접근할 수 있었고
-- 저장 후 수정할 방법이 없었음. mcp_usage_logs.tool CHECK 제약에 두 값을 추가한다.
alter table public.mcp_usage_logs drop constraint mcp_usage_logs_tool_check;
alter table public.mcp_usage_logs add constraint mcp_usage_logs_tool_check
  check (tool in ('search_knowledge', 'save_document', 'log_note', 'list_documents', 'edit_document'));

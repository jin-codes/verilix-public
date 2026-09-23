-- MCP에 문서 삭제 툴(delete_document)을 추가함 (src/mcp/tools/delete-document.ts).
-- mcp_usage_logs.tool CHECK 제약 확장.
alter table public.mcp_usage_logs drop constraint mcp_usage_logs_tool_check;
alter table public.mcp_usage_logs add constraint mcp_usage_logs_tool_check
  check (tool in (
    'search_knowledge', 'save_document', 'log_note',
    'list_documents', 'edit_document', 'delete_document',
    'list_categories', 'manage_category'
  ));

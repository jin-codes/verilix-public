-- MCP에 문서 연결 툴(link_documents — documents.related_document_ids를 양방향으로 잇거나 끊음)을
-- 추가함 (src/mcp/tools/link-documents.ts). mcp_usage_logs.tool CHECK 제약 확장.
alter table public.mcp_usage_logs drop constraint mcp_usage_logs_tool_check;
alter table public.mcp_usage_logs add constraint mcp_usage_logs_tool_check
  check (tool in (
    'search_knowledge', 'save_document', 'log_note',
    'list_documents', 'edit_document', 'delete_document',
    'document_history', 'restore_document',
    'list_categories', 'manage_category', 'manage_folder',
    'link_documents'
  ));

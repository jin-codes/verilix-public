-- MCP 문서 편집을 git처럼 만든다: 삭제는 하드 삭제 대신 is_archived 토글(데이터 보존),
-- 모든 변경은 document_versions에 이전 상태 + 커밋 메시지로 남겨 document_history로 조회하고
-- restore_document로 롤백. (src/mcp/tools/{edit,delete,restore}-document.ts, document-history.ts)
alter table public.document_versions add column if not exists message text;

alter table public.mcp_usage_logs drop constraint mcp_usage_logs_tool_check;
alter table public.mcp_usage_logs add constraint mcp_usage_logs_tool_check
  check (tool in (
    'search_knowledge', 'save_document', 'log_note',
    'list_documents', 'edit_document', 'delete_document',
    'document_history', 'restore_document',
    'list_categories', 'manage_category', 'manage_folder'
  ));

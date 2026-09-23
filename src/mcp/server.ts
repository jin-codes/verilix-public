import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerSearchKnowledgeTool } from './tools/search-knowledge'
import { registerSaveDocumentTool } from './tools/save-document'
import { registerLogNoteTool } from './tools/log-note'
import { registerListDocumentsTool } from './tools/list-documents'
import { registerEditDocumentTool } from './tools/edit-document'
import { registerDeleteDocumentTool } from './tools/delete-document'
import { registerDocumentHistoryTool } from './tools/document-history'
import { registerRestoreDocumentTool } from './tools/restore-document'
import { registerListCategoriesTool } from './tools/list-categories'
import { registerManageCategoriesTool } from './tools/manage-categories'
import { registerManageFoldersTool } from './tools/manage-folders'
import { registerLinkDocumentsTool } from './tools/link-documents'

export function configureMcpServer(server: McpServer) {
  registerSearchKnowledgeTool(server)
  registerSaveDocumentTool(server)
  registerLogNoteTool(server)
  registerListDocumentsTool(server)
  registerEditDocumentTool(server)
  registerDeleteDocumentTool(server)
  registerDocumentHistoryTool(server)
  registerRestoreDocumentTool(server)
  registerListCategoriesTool(server)
  registerManageCategoriesTool(server)
  registerManageFoldersTool(server)
  registerLinkDocumentsTool(server)
}

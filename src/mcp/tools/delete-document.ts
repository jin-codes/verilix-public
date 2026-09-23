import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { DOC_SNAPSHOT_COLUMNS, snapshotDocumentVersion, type DocSnapshotRow } from './_document-versioning'

export function registerDeleteDocumentTool(server: McpServer) {
  server.registerTool(
    'delete_document',
    {
      title: 'Delete Document',
      description:
        "Move a document to the trash in the user's verilix knowledge base. The data is kept, not erased — it stops showing up in list_documents / search_knowledge but can be brought back with restore_document, and its full history stays in document_history. Pass `message` to note why. Only delete when the user clearly asked to.",
      inputSchema: {
        documentId: z.string().describe('The id of the document to delete'),
        message: z.string().optional().describe('A short note on why it is being deleted (kept in the history).'),
      },
    },
    async ({ documentId, message }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return { content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }], isError: true }
      }

      const supabase = getMcpSupabaseClient()

      const { data: existing, error } = await supabase
        .from('documents')
        .select(DOC_SNAPSHOT_COLUMNS)
        .eq('id', documentId)
        .maybeSingle<DocSnapshotRow>()

      if (error) {
        return { content: [{ type: 'text', text: `Delete failed: ${error.message}` }], isError: true }
      }
      if (!existing || existing.user_id !== userId) {
        return { content: [{ type: 'text', text: `No document found with id ${documentId}.` }], isError: true }
      }
      if (existing.is_archived) {
        return { content: [{ type: 'text', text: `Document "${existing.title ?? documentId}" is already in the trash.` }] }
      }

      const currentVersion = existing.version ?? 1
      await snapshotDocumentVersion(supabase, userId, existing, message ?? 'Deleted')

      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_archived: true, version: currentVersion + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .eq('user_id', userId)

      if (updateError) {
        return { content: [{ type: 'text', text: `Delete failed: ${updateError.message}` }], isError: true }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'delete_document',
      })

      return {
        content: [
          {
            type: 'text',
            text: `Moved "${existing.title ?? documentId}" to the trash. Restore it with restore_document (id ${existing.id}).`,
          },
        ],
      }
    }
  )
}

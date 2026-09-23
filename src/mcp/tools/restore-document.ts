import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { tryGenerateDocumentEmbedding } from '@/lib/ai/embeddings'
import {
  DOC_SNAPSHOT_COLUMNS,
  snapshotDocumentVersion,
  snapshotToUpdate,
  type DocSnapshot,
  type DocSnapshotRow,
} from './_document-versioning'

export function registerRestoreDocumentTool(server: McpServer) {
  server.registerTool(
    'restore_document',
    {
      title: 'Restore Document',
      description:
        "Bring a document back in the user's verilix knowledge base. With no `toVersion`, this just takes it out of the trash (undoes delete_document). With `toVersion` (from document_history), it also rolls the document's content back to that saved version. Either way the current state is snapshotted first, so a restore can itself be undone.",
      inputSchema: {
        documentId: z.string().describe('The id of the document to restore'),
        toVersion: z
          .number()
          .int()
          .optional()
          .describe('A version number from document_history to roll the content back to. Omit to only un-delete.'),
        message: z.string().optional().describe('A short note for the history entry.'),
      },
    },
    async ({ documentId, toVersion, message }, extra) => {
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
        return { content: [{ type: 'text', text: `Restore failed: ${error.message}` }], isError: true }
      }
      if (!existing || existing.user_id !== userId) {
        return { content: [{ type: 'text', text: `No document found with id ${documentId}.` }], isError: true }
      }

      const currentVersion = existing.version ?? 1

      // 내용 롤백 없이 휴지통에서만 꺼내는 경우
      if (toVersion === undefined) {
        if (!existing.is_archived) {
          return {
            content: [
              {
                type: 'text',
                text: 'Document is not in the trash. Pass toVersion to roll its content back to an earlier version.',
              },
            ],
          }
        }
        await snapshotDocumentVersion(supabase, userId, existing, message ?? 'Restored from trash')
        const { error: updateError } = await supabase
          .from('documents')
          .update({ is_archived: false, version: currentVersion + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .eq('user_id', userId)
        if (updateError) {
          return { content: [{ type: 'text', text: `Restore failed: ${updateError.message}` }], isError: true }
        }
        await logUsage(supabase, userId, apiKeyId)
        return { content: [{ type: 'text', text: `Restored "${existing.title ?? documentId}" from the trash.` }] }
      }

      // 특정 버전으로 내용 롤백
      const { data: versionRow } = await supabase
        .from('document_versions')
        .select('snapshot')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .eq('version', toVersion)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ snapshot: DocSnapshot }>()

      if (!versionRow) {
        const { data: avail } = await supabase
          .from('document_versions')
          .select('version')
          .eq('document_id', documentId)
          .eq('user_id', userId)
          .order('version', { ascending: false })
        const list = [...new Set((avail ?? []).map((r) => r.version as number))].join(', ')
        return {
          content: [
            { type: 'text', text: `No saved version ${toVersion}. Available: ${list || '(none)'}. See document_history.` },
          ],
          isError: true,
        }
      }

      await snapshotDocumentVersion(supabase, userId, existing, message ?? `Rolled back to v${toVersion}`)

      const snap = versionRow.snapshot
      const restored = snapshotToUpdate(snap)
      const newEmbedding = await tryGenerateDocumentEmbedding({
        title: (snap.title ?? '') as string,
        summary: (snap.summary ?? '') as string,
        key_conclusion: snap.key_conclusion ?? null,
        learnings: snap.learnings ?? null,
      })

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          ...restored,
          is_archived: false,
          version: currentVersion + 1,
          updated_at: new Date().toISOString(),
          ...(newEmbedding ? { embedding: newEmbedding } : {}),
        })
        .eq('id', existing.id)
        .eq('user_id', userId)

      if (updateError) {
        return { content: [{ type: 'text', text: `Restore failed: ${updateError.message}` }], isError: true }
      }

      await logUsage(supabase, userId, apiKeyId)
      return {
        content: [
          {
            type: 'text',
            text: `Rolled "${existing.title ?? documentId}" back to v${toVersion} (now saved as v${currentVersion + 1}).`,
          },
        ],
      }
    }
  )
}

async function logUsage(
  supabase: ReturnType<typeof getMcpSupabaseClient>,
  userId: string,
  apiKeyId: string | undefined
) {
  await supabase.from('mcp_usage_logs').insert({
    user_id: userId,
    api_key_id: apiKeyId ?? null,
    tool: 'restore_document',
  })
}

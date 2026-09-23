import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { DOC_SNAPSHOT_COLUMNS, snapshotDocumentVersion, type DocSnapshotRow } from './_document-versioning'

// documents.related_document_ids(웹 문서 뷰의 "관련 문서" 섹션이 읽는 배열)를 수동으로
// 잇거나 끊는다. 링크는 항상 양방향 — 한쪽에 추가하면 상대 쪽에도 추가된다. edit/delete와
// 같은 git 방식으로, 실제로 바뀐 문서만 document_versions에 스냅샷을 남기고 version을 올린다.
export function registerLinkDocumentsTool(server: McpServer) {
  server.registerTool(
    'link_documents',
    {
      title: 'Link Documents',
      description:
        'Connect documents in the user\'s verilix knowledge base so each one shows up under the other\'s "Related documents". Pass the document id plus one or more other ids in `relatedIds` — the link is bidirectional. Use `action: "unlink"` to remove the connection. Every affected document is snapshotted first (see document_history / restore_document); pass `message` to label the change. Only link or unlink when the user asked for it.',
      inputSchema: {
        documentId: z
          .string()
          .describe('The document to link from (id from list_documents or search_knowledge)'),
        relatedIds: z
          .array(z.string())
          .min(1)
          .describe('One or more other document ids to link it to (or unlink from). Links are bidirectional.'),
        action: z
          .enum(['link', 'unlink'])
          .optional()
          .describe('"link" (default) adds the connection, "unlink" removes it.'),
        message: z
          .string()
          .optional()
          .describe('A short note describing this change, kept in each affected version history like a commit message.'),
      },
    },
    async ({ documentId, relatedIds, action, message }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return { content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }], isError: true }
      }

      const mode = action ?? 'link'

      // 자기 자신 링크와 중복은 제거한다.
      const targetIds = [...new Set(relatedIds.filter((id) => id !== documentId))]
      if (targetIds.length === 0) {
        return {
          content: [{ type: 'text', text: 'Nothing to do — relatedIds only referenced the document itself.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()

      const { data: source, error: sourceError } = await supabase
        .from('documents')
        .select(DOC_SNAPSHOT_COLUMNS)
        .eq('id', documentId)
        .maybeSingle<DocSnapshotRow>()

      if (sourceError) {
        return { content: [{ type: 'text', text: `Link failed: ${sourceError.message}` }], isError: true }
      }
      if (!source || source.user_id !== userId) {
        return { content: [{ type: 'text', text: `No document found with id ${documentId}.` }], isError: true }
      }

      const { data: targetsData, error: targetsError } = await supabase
        .from('documents')
        .select(DOC_SNAPSHOT_COLUMNS)
        .eq('user_id', userId)
        .in('id', targetIds)

      if (targetsError) {
        return { content: [{ type: 'text', text: `Link failed: ${targetsError.message}` }], isError: true }
      }

      const targets = (targetsData ?? []) as DocSnapshotRow[]
      const found = new Set(targets.map((t) => t.id))
      const missing = targetIds.filter((id) => !found.has(id))
      if (missing.length > 0) {
        return {
          content: [
            { type: 'text', text: `No document(s) found with id: ${missing.join(', ')}. Nothing was changed.` },
          ],
          isError: true,
        }
      }

      if (mode === 'link') {
        const archived = targets.filter((t) => t.is_archived)
        if (archived.length > 0) {
          return {
            content: [
              {
                type: 'text',
                text: `Cannot link to a document in the trash: ${archived
                  .map((t) => `"${t.title ?? t.id}"`)
                  .join(', ')}. Restore it first.`,
              },
            ],
            isError: true,
          }
        }
      }

      const note = message ?? (mode === 'link' ? 'Linked documents' : 'Unlinked documents')
      const changedTitles: string[] = []

      // 한 문서의 related_document_ids에 otherIds를 반영한다. 실제로 값이 바뀔 때만
      // 스냅샷 + version 증가.
      const applyTo = async (row: DocSnapshotRow, otherIds: string[]) => {
        const set = new Set(row.related_document_ids ?? [])
        for (const otherId of otherIds) {
          if (mode === 'link') set.add(otherId)
          else set.delete(otherId)
        }
        const before = [...(row.related_document_ids ?? [])].sort().join(',')
        const after = [...set].sort().join(',')
        if (before === after) return

        await snapshotDocumentVersion(supabase, userId, row, note)
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            related_document_ids: set.size > 0 ? [...set] : null,
            version: (row.version ?? 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id)
          .eq('user_id', userId)
        if (updateError) throw new Error(updateError.message)
        changedTitles.push(row.title ?? row.id)
      }

      try {
        await applyTo(source, targetIds)
        for (const target of targets) await applyTo(target, [documentId])
      } catch (err) {
        return {
          content: [
            { type: 'text', text: `Link failed partway through: ${err instanceof Error ? err.message : 'unknown error'}` },
          ],
          isError: true,
        }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'link_documents',
      })

      const targetLabel =
        targets.length === 1 ? `"${targets[0].title ?? targets[0].id}"` : `${targets.length} documents`
      const sourceLabel = `"${source.title ?? source.id}"`

      if (changedTitles.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text:
                mode === 'link'
                  ? `${sourceLabel} was already linked to ${targetLabel}. Nothing changed.`
                  : `${sourceLabel} was not linked to ${targetLabel}. Nothing changed.`,
            },
          ],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `${mode === 'link' ? 'Linked' : 'Unlinked'} ${sourceLabel} ${
              mode === 'link' ? '↔' : '⊘'
            } ${targetLabel} — both directions, ${changedTitles.length} document(s) updated.`,
          },
        ],
      }
    }
  )
}

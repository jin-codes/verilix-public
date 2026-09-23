import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'

interface VersionRow {
  version: number
  message: string | null
  created_at: string
  snapshot: { title?: string | null; is_archived?: boolean } | null
}

export function registerDocumentHistoryTool(server: McpServer) {
  server.registerTool(
    'document_history',
    {
      title: 'Document History',
      description:
        "Show the saved version history of one document — every past state that edit_document / delete_document / restore_document left behind, newest first, with the note recorded for each change. Use a version number here with restore_document to roll the document back.",
      inputSchema: {
        documentId: z.string().describe('The id of the document (from list_documents or search_knowledge)'),
      },
    },
    async ({ documentId }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return { content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }], isError: true }
      }

      const supabase = getMcpSupabaseClient()

      const { data: doc } = await supabase
        .from('documents')
        .select('id, user_id, title, version, is_archived')
        .eq('id', documentId)
        .maybeSingle<{ id: string; user_id: string; title: string | null; version: number | null; is_archived: boolean }>()

      if (!doc || doc.user_id !== userId) {
        return { content: [{ type: 'text', text: `No document found with id ${documentId}.` }], isError: true }
      }

      const { data: versions, error } = await supabase
        .from('document_versions')
        .select('version, message, created_at, snapshot')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .order('version', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        return { content: [{ type: 'text', text: `History lookup failed: ${error.message}` }], isError: true }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'document_history',
      })

      const header = `History for "${doc.title ?? 'Untitled'}" — current v${doc.version ?? 1}${
        doc.is_archived ? ' (in trash)' : ''
      }`

      const rows = (versions ?? []) as VersionRow[]
      if (rows.length === 0) {
        return { content: [{ type: 'text', text: `${header}\n\nNo earlier versions saved yet.` }] }
      }

      const body = rows
        .map((v) => {
          const bits = [`v${v.version} · ${v.created_at.slice(0, 10)}`]
          if (v.snapshot?.is_archived) bits.push('was in trash')
          const note = v.message ?? '(no note)'
          return `- ${bits.join(' · ')} — ${note}`
        })
        .join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `${header}\n\n${body}\n\nRoll back with restore_document(documentId, toVersion).`,
          },
        ],
      }
    }
  )
}

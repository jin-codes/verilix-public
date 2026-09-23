import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'

const docTypeEnum = z.enum(['general', 'meeting', 'spec', 'report', 'idea', 'research'])

interface DocumentRow {
  id: string
  title: string | null
  summary: string | null
  doc_type: string | null
  tags: string[] | null
  updated_at: string
}

export function registerListDocumentsTool(server: McpServer) {
  server.registerTool(
    'list_documents',
    {
      title: 'List Documents',
      description:
        "List every document in the user's verilix knowledge base, most recently updated first. Unlike search_knowledge this does not rank by relevance — it returns the whole library, page by page. Use it to browse or to find a document's id before calling edit_document.",
      inputSchema: {
        limit: z.number().int().min(1).max(200).optional().describe('Max documents per page (default 20)'),
        offset: z.number().int().min(0).optional().describe('Number of documents to skip, for paging (default 0)'),
        docType: docTypeEnum.optional().describe('Optional filter by document category'),
        archived: z
          .boolean()
          .optional()
          .describe('When true, list trashed (deleted) documents instead of active ones. Default false.'),
      },
    },
    async ({ limit, offset, docType, archived }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return {
          content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()
      const max = limit ?? 20
      const from = offset ?? 0

      let queryBuilder = supabase
        .from('documents')
        .select('id, title, summary, doc_type, tags, updated_at', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_archived', archived ?? false)
        .order('updated_at', { ascending: false })
        .range(from, from + max - 1)

      if (docType) queryBuilder = queryBuilder.eq('doc_type', docType)

      const { data, error, count } = await queryBuilder

      if (error) {
        return {
          content: [{ type: 'text', text: `List failed: ${error.message}` }],
          isError: true,
        }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'list_documents',
      })

      const rows = (data ?? []) as DocumentRow[]
      const total = count ?? rows.length

      if (rows.length === 0) {
        const empty = archived
          ? 'Trash is empty.'
          : from === 0
            ? 'No documents saved yet.'
            : 'No more documents.'
        return { content: [{ type: 'text', text: empty }] }
      }

      const shownEnd = from + rows.length
      const header = `${archived ? 'Trashed d' : 'D'}ocuments ${from + 1}–${shownEnd} of ${total}${
        docType ? ` (type: ${docType})` : ''
      }`
      const body = rows
        .map((doc) => {
          const lines = [
            `[${doc.id}] ${doc.title ?? 'Untitled'}`,
            `  updated ${doc.updated_at.slice(0, 10)} · ${doc.doc_type ?? 'general'}${
              doc.tags?.length ? ` · ${doc.tags.join(', ')}` : ''
            }`,
          ]
          if (doc.summary) {
            const flat = doc.summary.replace(/\s+/g, ' ').trim()
            lines.push(`  ${flat.length > 200 ? `${flat.slice(0, 200)}…` : flat}`)
          }
          return lines.join('\n')
        })
        .join('\n\n')

      const more =
        shownEnd < total ? `\n\n(${total - shownEnd} more — call again with offset ${shownEnd})` : ''

      return { content: [{ type: 'text', text: `${header}\n\n${body}${more}` }] }
    }
  )
}

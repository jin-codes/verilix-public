import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'

interface RootNode {
  id: string
  name: string
}

export function registerListCategoriesTool(server: McpServer) {
  server.registerTool(
    'list_categories',
    {
      title: 'List Categories',
      description:
        "List the user's top-level knowledge-base categories with how many documents sit in each. Use it before moving a document to a category (edit_document) or renaming/merging categories (manage_category).",
      inputSchema: {},
    },
    async (_args, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return {
          content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()

      const [{ data: nodes, error }, { data: docs }] = await Promise.all([
        supabase
          .from('tag_nodes')
          .select('id, name')
          .eq('user_id', userId)
          .is('parent_id', null)
          .order('name', { ascending: true }),
        supabase.from('documents').select('tag_node_id').eq('user_id', userId).eq('is_archived', false),
      ])

      if (error) {
        return { content: [{ type: 'text', text: `List failed: ${error.message}` }], isError: true }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'list_categories',
      })

      const counts = new Map<string, number>()
      let uncategorized = 0
      for (const row of (docs ?? []) as { tag_node_id: string | null }[]) {
        if (row.tag_node_id) counts.set(row.tag_node_id, (counts.get(row.tag_node_id) ?? 0) + 1)
        else uncategorized += 1
      }

      const rows = (nodes ?? []) as RootNode[]
      if (rows.length === 0 && uncategorized === 0) {
        return { content: [{ type: 'text', text: 'No categories yet.' }] }
      }

      const lines = rows.map((n) => `- ${n.name} (${counts.get(n.id) ?? 0}) · id ${n.id}`)
      if (uncategorized > 0) lines.push(`- (uncategorized) (${uncategorized})`)

      return { content: [{ type: 'text', text: `Categories:\n${lines.join('\n')}` }] }
    }
  )
}

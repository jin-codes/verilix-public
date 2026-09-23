import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { findRootTagNode } from '@/lib/ai/tag-nodes'

export function registerManageCategoriesTool(server: McpServer) {
  server.registerTool(
    'manage_category',
    {
      title: 'Manage Categories',
      description:
        "Rename or merge the user's top-level knowledge-base categories. " +
        "'rename' changes a category's name in place. 'merge' moves every document and background note from one category into another and then removes the empty one. " +
        'Get current category names from list_categories first.',
      inputSchema: {
        action: z.enum(['rename', 'merge']).describe("'rename' or 'merge'"),
        name: z.string().describe('The existing category to act on (case-insensitive match)'),
        newName: z.string().optional().describe("For 'rename': the new name for the category"),
        into: z.string().optional().describe("For 'merge': the target category that `name` is merged into (created if missing)"),
      },
    },
    async ({ action, name, newName, into }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return { content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }], isError: true }
      }

      const supabase = getMcpSupabaseClient()
      const source = await findRootTagNode(supabase, userId, name)
      if (!source) {
        return { content: [{ type: 'text', text: `No category named "${name}".` }], isError: true }
      }

      let resultText: string
      try {
        if (action === 'rename') {
          if (!newName || !newName.trim()) {
            return { content: [{ type: 'text', text: "'rename' needs newName." }], isError: true }
          }
          const clash = await findRootTagNode(supabase, userId, newName)
          if (clash && clash.id !== source.id) {
            return {
              content: [
                {
                  type: 'text',
                  text: `A category "${clash.name}" already exists. Use action "merge" with into: "${clash.name}" instead.`,
                },
              ],
              isError: true,
            }
          }
          const { error } = await supabase
            .from('tag_nodes')
            .update({ name: newName.trim() })
            .eq('id', source.id)
            .eq('user_id', userId)
          if (error) throw error
          resultText = `Renamed category "${source.name}" → "${newName.trim()}".`
        } else {
          if (!into || !into.trim()) {
            return { content: [{ type: 'text', text: "'merge' needs into." }], isError: true }
          }
          let target = await findRootTagNode(supabase, userId, into)
          if (!target) {
            const { data: created, error } = await supabase
              .from('tag_nodes')
              .insert({ user_id: userId, parent_id: null, name: into.trim(), depth: 1 })
              .select('id, name')
              .single()
            if (error || !created) throw error ?? new Error('could not create target category')
            target = { id: created.id as string, name: created.name as string }
          }
          if (target.id === source.id) {
            return { content: [{ type: 'text', text: 'Source and target are the same category.' }], isError: true }
          }
          const moved = await mergeInto(supabase, userId, source.id, target.id)
          resultText = `Merged "${source.name}" into "${target.name}" — moved ${moved.documents} document(s) and ${moved.notes} note(s), then removed "${source.name}".`
        }
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Failed: ${err instanceof Error ? err.message : 'unknown error'}` }],
          isError: true,
        }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'manage_category',
      })

      return { content: [{ type: 'text', text: resultText }] }
    }
  )
}

// 소스 카테고리의 참조를 타깃으로 옮기고 소스 노드를 삭제한다.
async function mergeInto(
  supabase: SupabaseClient,
  userId: string,
  sourceId: string,
  targetId: string
): Promise<{ documents: number; notes: number }> {
  const { data: movedDocs } = await supabase
    .from('documents')
    .update({ tag_node_id: targetId })
    .eq('user_id', userId)
    .eq('tag_node_id', sourceId)
    .select('id')

  const { data: movedNotes } = await supabase
    .from('assistant_notes')
    .update({ tag_node_id: targetId })
    .eq('user_id', userId)
    .eq('tag_node_id', sourceId)
    .select('id')

  // topic_insights는 (user_id, tag_node_id) unique — 타깃에 이미 행이 있으면 소스 것은 버린다
  // (옮긴 노트가 이후 다시 합성됨). 없으면 소스 행을 타깃으로 재지정.
  const { data: targetInsight } = await supabase
    .from('topic_insights')
    .select('id')
    .eq('user_id', userId)
    .eq('tag_node_id', targetId)
    .maybeSingle()
  if (targetInsight) {
    await supabase.from('topic_insights').delete().eq('user_id', userId).eq('tag_node_id', sourceId)
  } else {
    await supabase
      .from('topic_insights')
      .update({ tag_node_id: targetId })
      .eq('user_id', userId)
      .eq('tag_node_id', sourceId)
  }

  // 하위 태그 노드가 있으면 부모를 타깃으로 옮긴다. 이름 충돌 시(unique) 실패하는 건
  // 그대로 두고 소스 삭제 시 cascade로 정리되게 둔다.
  await supabase
    .from('tag_nodes')
    .update({ parent_id: targetId })
    .eq('user_id', userId)
    .eq('parent_id', sourceId)

  // 남은 참조(digest_snapshots 등)는 tag_node 삭제 시 cascade/set null로 정리된다.
  await supabase.from('tag_nodes').delete().eq('id', sourceId).eq('user_id', userId)

  return { documents: (movedDocs ?? []).length, notes: (movedNotes ?? []).length }
}

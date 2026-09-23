import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'

interface FolderRow {
  id: string
  name: string
  parent_id: string | null
  sort_order: number | null
}

// 이름으로 폴더를 대소문자 무시하고 찾는다. 여러 개면 애매하다는 뜻으로 'ambiguous'를 던진다.
async function resolveFolder(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<FolderRow | null | 'ambiguous'> {
  const { data } = await supabase
    .from('folders')
    .select('id, name, parent_id, sort_order')
    .eq('user_id', userId)
  const lower = name.trim().toLowerCase()
  const matches = ((data ?? []) as FolderRow[]).filter((f) => f.name.toLowerCase() === lower)
  if (matches.length === 0) return null
  if (matches.length > 1) return 'ambiguous'
  return matches[0]
}

function renderTree(folders: FolderRow[], docCounts: Map<string, number>): string {
  const byParent = new Map<string | null, FolderRow[]>()
  for (const f of folders) {
    const key = f.parent_id
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(f)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name))
  }
  const lines: string[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const f of byParent.get(parentId) ?? []) {
      lines.push(`${'  '.repeat(depth)}- ${f.name} (${docCounts.get(f.id) ?? 0}) · id ${f.id}`)
      walk(f.id, depth + 1)
    }
  }
  walk(null, 0)
  return lines.join('\n')
}

export function registerManageFoldersTool(server: McpServer) {
  server.registerTool(
    'manage_folder',
    {
      title: 'Manage Folders',
      description:
        "List, create, rename, move, or delete folders in the user's verilix knowledge base. Folders are a nesting structure for documents, separate from categories (tags). To put a document in a folder, call edit_document with its `folder` field.",
      inputSchema: {
        action: z.enum(['list', 'create', 'rename', 'move', 'delete']).describe('What to do'),
        name: z
          .string()
          .optional()
          .describe('The folder to act on (for create: the name of the new folder). Not needed for `list`.'),
        newName: z.string().optional().describe("For `rename`: the folder's new name"),
        parent: z
          .string()
          .optional()
          .describe('For `create` / `move`: the parent folder name to nest under. Omit or pass "" for top level.'),
      },
    },
    async ({ action, name, newName, parent }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return { content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }], isError: true }
      }

      const supabase = getMcpSupabaseClient()

      const resolveParent = async (): Promise<string | null | { error: string }> => {
        if (!parent || !parent.trim()) return null
        const p = await resolveFolder(supabase, userId, parent)
        if (p === null) return { error: `No parent folder named "${parent}".` }
        if (p === 'ambiguous') return { error: `Multiple folders named "${parent}" — cannot disambiguate by name.` }
        return p.id
      }

      let resultText: string
      try {
        if (action === 'list') {
          const [{ data: folders }, { data: docs }] = await Promise.all([
            supabase.from('folders').select('id, name, parent_id, sort_order').eq('user_id', userId),
            supabase.from('documents').select('folder_id').eq('user_id', userId).eq('is_archived', false),
          ])
          const counts = new Map<string, number>()
          for (const d of (docs ?? []) as { folder_id: string | null }[]) {
            if (d.folder_id) counts.set(d.folder_id, (counts.get(d.folder_id) ?? 0) + 1)
          }
          const rows = (folders ?? []) as FolderRow[]
          resultText = rows.length === 0 ? 'No folders yet.' : `Folders:\n${renderTree(rows, counts)}`
        } else if (action === 'create') {
          if (!name || !name.trim()) {
            return { content: [{ type: 'text', text: '`create` needs name.' }], isError: true }
          }
          const parentId = await resolveParent()
          if (parentId && typeof parentId === 'object') {
            return { content: [{ type: 'text', text: parentId.error }], isError: true }
          }
          const { data, error } = await supabase
            .from('folders')
            .insert({ user_id: userId, name: name.trim(), parent_id: parentId })
            .select('id')
            .single()
          if (error || !data) throw error ?? new Error('insert failed')
          resultText = `Created folder "${name.trim()}"${parent ? ` under "${parent}"` : ''} (id ${data.id}).`
        } else {
          if (!name || !name.trim()) {
            return { content: [{ type: 'text', text: `\`${action}\` needs name.` }], isError: true }
          }
          const target = await resolveFolder(supabase, userId, name)
          if (target === null) {
            return { content: [{ type: 'text', text: `No folder named "${name}".` }], isError: true }
          }
          if (target === 'ambiguous') {
            return {
              content: [{ type: 'text', text: `Multiple folders named "${name}" — cannot disambiguate by name.` }],
              isError: true,
            }
          }

          if (action === 'rename') {
            if (!newName || !newName.trim()) {
              return { content: [{ type: 'text', text: '`rename` needs newName.' }], isError: true }
            }
            const { error } = await supabase
              .from('folders')
              .update({ name: newName.trim() })
              .eq('id', target.id)
              .eq('user_id', userId)
            if (error) throw error
            resultText = `Renamed folder "${target.name}" → "${newName.trim()}".`
          } else if (action === 'move') {
            const parentId = await resolveParent()
            if (parentId && typeof parentId === 'object') {
              return { content: [{ type: 'text', text: parentId.error }], isError: true }
            }
            if (parentId === target.id) {
              return { content: [{ type: 'text', text: 'A folder cannot be its own parent.' }], isError: true }
            }
            const { error } = await supabase
              .from('folders')
              .update({ parent_id: parentId })
              .eq('id', target.id)
              .eq('user_id', userId)
            if (error) throw error
            resultText = `Moved folder "${target.name}" ${parent && parent.trim() ? `under "${parent}"` : 'to top level'}.`
          } else {
            // delete — 하위 폴더는 cascade로 함께 삭제되고, 문서의 folder_id는 set null 된다.
            const { data: freed } = await supabase
              .from('documents')
              .update({ folder_id: null })
              .eq('user_id', userId)
              .eq('folder_id', target.id)
              .select('id')
            const { error } = await supabase.from('folders').delete().eq('id', target.id).eq('user_id', userId)
            if (error) throw error
            resultText = `Deleted folder "${target.name}". ${
              (freed ?? []).length
            } document(s) were unfiled (nested subfolders were also removed).`
          }
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
        tool: 'manage_folder',
      })

      return { content: [{ type: 'text', text: resultText }] }
    }
  )
}

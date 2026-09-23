import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import {
  classifyBroadTag,
  findOrCreateTopTagNode,
  getAllTagNames,
  getTopTagNames,
  matchExistingTopTag,
  reconcileTags,
} from '@/lib/ai/tag-nodes'
import { tryGenerateDocumentEmbedding } from '@/lib/ai/embeddings'
import { DOC_SNAPSHOT_COLUMNS, snapshotDocumentVersion, type DocSnapshotRow } from './_document-versioning'

const anthropic = new Anthropic()

const docTypeEnum = z.enum(['general', 'meeting', 'spec', 'report', 'idea', 'research'])

export function registerEditDocumentTool(server: McpServer) {
  server.registerTool(
    'edit_document',
    {
      title: 'Edit Document',
      description:
        "Update a document already saved in the user's verilix knowledge base — rename it (title), rewrite any section, replace its keyword tags, move it to a different category or folder, or change its type. Pass the document id (from list_documents or search_knowledge) plus only the fields you want to change — omitted fields are left untouched. The previous version is snapshotted first (see document_history / restore_document) so the change can be rolled back; pass `message` to label it. verilix stores your fields as-is; write summary/keyConclusion/learnings in structured markdown with KaTeX `$...$` / `$$...$$` for math (each block delimiter on its own line).",
      inputSchema: {
        documentId: z.string().describe('The id of the document to edit'),
        title: z.string().optional().describe('New title'),
        summary: z.string().optional().describe('New summary, in structured markdown'),
        keyConclusion: z.string().optional().describe('New key conclusion, in structured markdown'),
        learnings: z.string().optional().describe('New learnings / insights, in structured markdown'),
        actionItems: z.array(z.string()).optional().describe('Replacement list of action items (replaces the existing list)'),
        followUpQuestions: z
          .array(z.string())
          .optional()
          .describe('Replacement list of follow-up questions (replaces the existing list)'),
        tags: z.array(z.string()).optional().describe('Replacement list of 2-5 keyword tags'),
        category: z
          .string()
          .optional()
          .describe(
            'Move the document to this top-level category (created if it does not exist). Overrides the automatic categorization derived from tags. Use list_categories to see existing category names.'
          ),
        folder: z
          .string()
          .optional()
          .describe(
            'Put the document in this folder (must already exist — create it with manage_folder first). Pass "" to remove it from its folder. Folders are separate from categories.'
          ),
        docType: docTypeEnum.optional().describe('New document type (general/meeting/spec/report/idea/research)'),
        rawConversation: z.string().optional().describe('Replacement raw conversation text stored alongside the document'),
        message: z
          .string()
          .optional()
          .describe('A short note describing this change, kept in the version history like a commit message.'),
      },
    },
    async (
      {
        documentId,
        title,
        summary,
        keyConclusion,
        learnings,
        actionItems,
        followUpQuestions,
        tags,
        category,
        folder,
        docType,
        rawConversation,
        message,
      },
      extra
    ) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return {
          content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }],
          isError: true,
        }
      }

      const hasAnyField =
        title !== undefined ||
        summary !== undefined ||
        keyConclusion !== undefined ||
        learnings !== undefined ||
        actionItems !== undefined ||
        followUpQuestions !== undefined ||
        tags !== undefined ||
        category !== undefined ||
        folder !== undefined ||
        docType !== undefined ||
        rawConversation !== undefined
      if (!hasAnyField) {
        return {
          content: [{ type: 'text', text: 'Nothing to update — pass at least one field to change.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()

      const { data: existing, error: fetchError } = await supabase
        .from('documents')
        .select(DOC_SNAPSHOT_COLUMNS)
        .eq('id', documentId)
        .maybeSingle<DocSnapshotRow>()

      if (fetchError) {
        return { content: [{ type: 'text', text: `Edit failed: ${fetchError.message}` }], isError: true }
      }
      if (!existing || existing.user_id !== userId) {
        return { content: [{ type: 'text', text: `No document found with id ${documentId}.` }], isError: true }
      }

      // 갱신 전 현재 상태를 document_versions에 스냅샷으로 남겨 되돌릴 수 있게 한다.
      const currentVersion = existing.version ?? 1
      await snapshotDocumentVersion(supabase, userId, existing, message ?? null)

      // category를 명시하면 그 카테고리로 직접 이동한다(자동 분류보다 우선). 없으면
      // tags가 바뀔 때만 save_document와 같은 방식으로 대분류를 다시 잡는다.
      let nextTags = existing.tags ?? []
      let nextTagNodeId = existing.tag_node_id
      let categoryChanged = false

      if (category !== undefined && category.trim()) {
        try {
          nextTagNodeId = await findOrCreateTopTagNode(supabase, userId, category.trim())
          categoryChanged = true
        } catch {
          // 카테고리 이동 실패는 조용히 무시 — 나머지 필드 갱신은 계속한다.
        }
      }

      if (tags !== undefined) {
        nextTags = tags
        try {
          const [topTags, allTags] = await Promise.all([
            getTopTagNames(supabase, userId),
            getAllTagNames(supabase, userId),
          ])
          if (tags.length > 0) {
            nextTags = await reconcileTags(anthropic, allTags, tags)
          }
          // category가 따로 지정됐으면 태그로 대분류를 다시 잡지 않는다.
          if (category === undefined) {
            const broadTag =
              matchExistingTopTag(topTags, nextTags) ??
              (await classifyBroadTag(anthropic, topTags, {
                title: title ?? existing.title ?? 'Untitled',
                summary: summary ?? existing.summary ?? '',
              }))
            nextTagNodeId = await findOrCreateTopTagNode(supabase, userId, broadTag)
          }
        } catch {
          // 태그 정리 실패는 조용히 무시 — 넘어온 태그를 그대로 저장한다.
        }
      }

      // folder: 빈 문자열이면 폴더에서 빼고(null), 이름을 주면 기존 폴더를 찾아 그 id로 넣는다.
      let nextFolderId: string | null | undefined
      if (folder !== undefined) {
        if (!folder.trim()) {
          nextFolderId = null
        } else {
          const { data: folders } = await supabase
            .from('folders')
            .select('id, name')
            .eq('user_id', userId)
          const lower = folder.trim().toLowerCase()
          const hits = ((folders ?? []) as { id: string; name: string }[]).filter(
            (f) => f.name.toLowerCase() === lower
          )
          if (hits.length === 0) {
            return {
              content: [
                { type: 'text', text: `No folder named "${folder}". Create it with manage_folder first.` },
              ],
              isError: true,
            }
          }
          if (hits.length > 1) {
            return {
              content: [{ type: 'text', text: `Multiple folders named "${folder}" — cannot pick one by name.` }],
              isError: true,
            }
          }
          nextFolderId = hits[0].id
        }
      }

      const merged = {
        title: title ?? existing.title ?? 'Untitled',
        summary: summary ?? existing.summary ?? '',
        key_conclusion: keyConclusion ?? existing.key_conclusion ?? null,
        learnings: learnings ?? existing.learnings ?? null,
      }

      // 본문 필드가 하나라도 바뀌면 임베딩을 다시 생성한다. 실패는 null로 흡수(기존 값 유지).
      const contentChanged =
        title !== undefined || summary !== undefined || keyConclusion !== undefined || learnings !== undefined
      const newEmbedding = contentChanged ? await tryGenerateDocumentEmbedding(merged) : null

      const updatePayload: Record<string, unknown> = {
        version: currentVersion + 1,
        updated_at: new Date().toISOString(),
      }
      if (title !== undefined) updatePayload.title = merged.title
      if (summary !== undefined) updatePayload.summary = merged.summary
      if (keyConclusion !== undefined) updatePayload.key_conclusion = keyConclusion
      if (learnings !== undefined) updatePayload.learnings = learnings
      if (actionItems !== undefined) updatePayload.action_items = actionItems
      if (followUpQuestions !== undefined) updatePayload.follow_up_questions = followUpQuestions
      if (docType !== undefined) updatePayload.doc_type = docType
      if (rawConversation !== undefined) updatePayload.raw_conversation = { text: rawConversation }
      if (tags !== undefined) updatePayload.tags = nextTags
      if (tags !== undefined || categoryChanged) updatePayload.tag_node_id = nextTagNodeId
      if (nextFolderId !== undefined) updatePayload.folder_id = nextFolderId
      if (newEmbedding) updatePayload.embedding = newEmbedding

      const { error: updateError } = await supabase
        .from('documents')
        .update(updatePayload)
        .eq('id', existing.id)
        .eq('user_id', userId)

      if (updateError) {
        return { content: [{ type: 'text', text: `Edit failed: ${updateError.message}` }], isError: true }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'edit_document',
      })

      const changed = Object.keys(updatePayload).filter((k) => k !== 'version' && k !== 'updated_at')
      return {
        content: [
          {
            type: 'text',
            text: `Updated document ${existing.id} (now version ${currentVersion + 1}). Changed: ${changed.join(', ')}.`,
          },
        ],
      }
    }
  )
}

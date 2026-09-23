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
import { recordAssistantNotes } from '@/lib/ai/topic-insights'

const anthropic = new Anthropic()

const docTypeEnum = z.enum(['general', 'meeting', 'spec', 'report', 'idea', 'research'])

export function registerSaveDocumentTool(server: McpServer) {
  server.registerTool(
    'save_document',
    {
      title: 'Save Document',
      description:
        "Save a conversation or piece of knowledge from this AI client into the user's verilix knowledge base as a document. " +
        'verilix trusts your fields as-is and stores them verbatim — it does not run any further summarization model on top, so write summary/keyConclusion/learnings yourself the way you want them to read in the knowledge base (structured with markdown headings/lists/bold, and KaTeX `$...$` / `$$...$$` for any math, each block delimiter on its own line).',
      inputSchema: {
        title: z.string().describe('Short title for the document'),
        summary: z.string().describe('Summary of the conversation or knowledge, written in structured markdown'),
        keyConclusion: z.string().optional().describe('The key conclusion or takeaway, if any, in structured markdown'),
        learnings: z.string().optional().describe('Learnings or insights from this conversation, if any, in structured markdown'),
        actionItems: z.array(z.string()).optional().describe('Action items / to-dos, if any actually exist — do not invent them'),
        followUpQuestions: z.array(z.string()).optional().describe('Follow-up questions, if any actually exist — do not invent them'),
        tags: z.array(z.string()).optional().describe('2-5 short keyword tags categorizing the document, chosen by you'),
        docType: docTypeEnum.optional().describe('Document category (default: general)'),
        rawConversation: z.string().optional().describe('Raw conversation text to store alongside the document, for reference'),
        note: z
          .string()
          .optional()
          .describe(
            "Optional. A private personalization note about the user's proficiency, interests, or tendencies on this document's topic. verilix stores it as background context for future sessions; it is not shown inline in the knowledge base. Don't recite it back to the user unprompted, but you don't need to hide that verilix keeps such notes if they ask."
          ),
      },
    },
    async (
      { title, summary, keyConclusion, learnings, actionItems, followUpQuestions, tags, docType, rawConversation, note },
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

      const supabase = getMcpSupabaseClient()

      // MCP로 저장되는 문서는 우리 쪽 대화 기록/TOPIC 태그가 전혀 없으므로, tag_nodes 트리
      // 편입을 위해 AI가 내용을 보고 대분류를 대신 골라준다 (title/summary 등 본문 필드와
      // 달리 이건 조직화용 메타데이터라 "필드를 가공 없이 그대로 저장" 원칙과 무관함).
      // 마찬가지로 외부 AI가 자유롭게 지은 tags도 기존 어휘와 대조해 같은 의미면 이름을 통일한다
      // (tag_node 트리와 documents.tags가 서로 다른 사전으로 갈라지지 않게 하기 위함).
      let tagNodeId: string | null = null
      let broadTag: string | null = null
      let reconciledTags = tags ?? []
      try {
        const [topTags, allTags] = await Promise.all([
          getTopTagNames(supabase, userId),
          getAllTagNames(supabase, userId),
        ])
        if (tags && tags.length > 0) {
          reconciledTags = await reconcileTags(anthropic, allTags, tags)
        }
        // 태그 정리 결과가 이미 기존 대분류 이름과 겹치면 그대로 재사용하고, 없을 때만
        // AI를 한 번 더 불러 분류한다 — reconcile 호출과 목적이 겹치는 호출을 아끼기 위함.
        broadTag =
          matchExistingTopTag(topTags, reconciledTags) ??
          (await classifyBroadTag(anthropic, topTags, { title, summary }))
        tagNodeId = await findOrCreateTopTagNode(supabase, userId, broadTag)
      } catch {
        // 분류 실패는 조용히 무시 — tag_node_id/태그 정리 없이도 문서 저장 자체는 막지 않는다.
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          title,
          summary,
          key_conclusion: keyConclusion ?? null,
          learnings: learnings ?? null,
          action_items: actionItems ?? [],
          follow_up_questions: followUpQuestions ?? [],
          tags: reconciledTags,
          doc_type: docType ?? 'general',
          doc_trigger: 'manual',
          tag_node_id: tagNodeId,
          raw_conversation: rawConversation ? { text: rawConversation } : null,
        })
        .select('id')
        .single()

      if (error || !data) {
        return {
          content: [{ type: 'text', text: `Save failed: ${error?.message ?? 'unknown error'}` }],
          isError: true,
        }
      }

      // note: 웹 채팅 NOTE 태그와 동일한 저장 경로(assistant_notes → topic_insights 합성).
      // log_note와 달리 문서를 만들며 이미 구한 broadTag/tagNodeId를 그대로 재사용한다
      // (note 본문만으로 대분류를 다시 판단할 필요가 없어 더 정확한 태그 신호).
      if (note) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('ai_response_language')
            .eq('id', userId)
            .maybeSingle()
          const languageLabel =
            profile?.ai_response_language === 'ko' ? '한국어' : profile?.ai_response_language === 'en' ? 'English' : null

          await recordAssistantNotes(supabase, anthropic, {
            userId,
            conversationId: null,
            tagNodeId,
            tagLabel: broadTag ?? 'general',
            contents: [note],
            languageLabel,
          })
        } catch {
          // 관찰 기록 저장 실패는 조용히 무시 — 문서 저장 자체는 이미 완료됨.
        }
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'save_document',
      })

      return { content: [{ type: 'text', text: `Saved as document ${data.id}.` }] }
    }
  )
}

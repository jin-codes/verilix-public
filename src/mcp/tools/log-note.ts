import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMcpSupabaseClient } from '../auth'
import { classifyBroadTag, findOrCreateTopTagNode, getTopTagNames } from '@/lib/ai/tag-nodes'
import { recordAssistantNotes } from '@/lib/ai/topic-insights'

const anthropic = new Anthropic()

export function registerLogNoteTool(server: McpServer) {
  server.registerTool(
    'log_note',
    {
      title: 'Log Note',
      description:
        'Records background context for verilix, separate from saved documents: a private personalization note about the ' +
        "user's proficiency/interests on the current topic (`note`), and/or internal feedback for verilix's developers about " +
        'this connector — bugs, unclear or contradictory tool descriptions, improvement ideas (`devComment`). ' +
        'Use it even when there is nothing to save as a document. Provide at least one of the two fields; both may be sent together. ' +
        "Don't narrate this call or read its contents back to the user unprompted; if they ask, it's fine to say verilix keeps private notes to personalize future sessions.",
      inputSchema: {
        note: z
          .string()
          .optional()
          .describe(
            "A private observation about the user's proficiency, interests, or tendencies on the current topic. verilix uses it as background context in future sessions; it is not surfaced inline. Don't recite it back to the user unprompted."
          ),
        devComment: z
          .string()
          .optional()
          .describe(
            "Free-form feedback to verilix's developers — a bug, a gap or contradiction in a tool description, an improvement idea, anything at your discretion. Only the developer reviews it; don't relay its content to the user unprompted."
          ),
      },
    },
    async ({ note, devComment }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined
      const apiKeyId = extra.authInfo?.extra?.apiKeyId as string | undefined
      if (!userId) {
        return {
          content: [{ type: 'text', text: 'Unauthorized: missing API key context.' }],
          isError: true,
        }
      }
      if (!note && !devComment) {
        return {
          content: [{ type: 'text', text: 'Provide at least one of `note` or `devComment`.' }],
          isError: true,
        }
      }

      const supabase = getMcpSupabaseClient()

      // note: 웹 채팅 NOTE 태그와 동일한 저장 경로(assistant_notes → topic_insights 합성).
      // save_document와 달리 문서 title/summary가 없으므로 note 본문 자체로 대분류를 판단한다.
      if (note) {
        try {
          const topTags = await getTopTagNames(supabase, userId)
          const broadTag = await classifyBroadTag(anthropic, topTags, { title: 'Observation', summary: note })
          const tagNodeId = await findOrCreateTopTagNode(supabase, userId, broadTag)

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
            tagLabel: broadTag,
            contents: [note],
            languageLabel,
          })
        } catch {
          // 분류/저장 실패는 조용히 무시 — devComment는 계속 처리한다.
        }
      }

      // devComment: dev_comments와 동일 패턴(insert-only, 유저 본인도 조회 불가, /admin에서만 확인).
      if (devComment) {
        await supabase.from('dev_comments').insert({
          user_id: userId,
          conversation_id: null,
          content: devComment,
        })
      }

      await supabase.from('mcp_usage_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId ?? null,
        tool: 'log_note',
      })

      const logged = [note ? 'note' : null, devComment ? 'devComment' : null].filter(Boolean).join(' and ')
      return { content: [{ type: 'text', text: `Logged ${logged}.` }] }
    }
  )
}

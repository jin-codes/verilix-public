import { createMcpHandler, withMcpAuth } from 'mcp-handler'
import { configureMcpServer } from '@/mcp/server'
import { verifyApiKey } from '@/mcp/auth'
import { verifyOAuthAccessToken } from '@/mcp/oauth'

// instructions: MCP init 응답에 실려 대부분의 클라이언트가 모델 컨텍스트에 얹어주는
// 서버 전역 지침 — 커넥터의 역할을 있는 그대로 설명하고, tool call을 능동적으로 중계하거나
// 내부 노트/피드백 내용을 먼저 읊지는 말되 유저가 직접 물으면 정직하게 답하도록 함(예전엔
// "물어봐도 부인하라"였음 — 강제도 안 되고 들키면 신뢰만 깨져서 폐기). 실제 준수 여부는
// 접속 LLM/클라이언트 재량. 툴이 늘어나면(편집/삭제/버전관리/폴더 등) 여기도 같이 갱신할 것.
const handler = createMcpHandler(
  (server) => configureMcpServer(server),
  {
    instructions:
      "This connector is the user's personal verilix knowledge base. You can:\n" +
      "- save conversations and knowledge to it as documents (save_document), and search or browse what's there (search_knowledge, list_documents, list_categories, manage_folder action:list);\n" +
      "- fully curate it on the user's behalf: rename documents, rewrite sections, retag, recategorize, or refile them (edit_document); organize with categories (manage_category) and folders (manage_folder); connect related documents so each surfaces under the other (link_documents);\n" +
      "- delete and undo: delete_document moves a document to the trash (the data is kept, not erased); restore_document brings it back or rolls it to an earlier state; document_history shows every saved version. Edits and deletes are versioned like commits — pass a short `message` describing the change.\n" +
      "- record private personalization notes about the user's proficiency/interests on a topic (verilix reuses these as background context in later sessions), and send internal feedback to verilix's developers (log_note, or the note field on save_document).\n\n" +
      "Only delete, overwrite, or reorganize when the user asked for it — this is their knowledge base, not a scratchpad. Don't narrate every tool call, and don't read internal note or feedback content back to the user unprompted. " +
      "But don't be deceptive: if the user asks what this connector does, what you changed, or whether it keeps notes about them, answer honestly.",
  },
  {
    basePath: '/api',
    maxDuration: 60,
  }
)

// vlx_ 프리픽스는 /settings에서 발급하는 고정 API 키(mcp_api_keys), 그 외(vlxo_)는
// OAuth 토큰 교환으로 발급된 토큰(mcp_oauth_tokens) — Claude Desktop 등은 API 키를,
// ChatGPT처럼 OAuth만 지원하는 커넥터는 아래 /api/mcp/oauth/* 플로우로 발급받은 토큰을 사용
const authHandler = withMcpAuth(
  handler,
  async (_req, bearerToken) => {
    if (!bearerToken) return undefined

    if (bearerToken.startsWith('vlx_')) {
      const verified = await verifyApiKey(bearerToken)
      if (!verified) return undefined
      return {
        token: bearerToken,
        clientId: verified.userId,
        scopes: ['knowledge:read', 'knowledge:write'],
        extra: { userId: verified.userId, apiKeyId: verified.apiKeyId },
      }
    }

    const verified = await verifyOAuthAccessToken(bearerToken)
    if (!verified) return undefined
    return {
      token: bearerToken,
      clientId: verified.userId,
      scopes: verified.scopes.length ? verified.scopes : ['knowledge:read', 'knowledge:write'],
      extra: { userId: verified.userId, oauthTokenId: verified.tokenId },
    }
  },
  { required: true }
)

export { authHandler as GET, authHandler as POST, authHandler as DELETE }

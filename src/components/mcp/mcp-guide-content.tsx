'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Check, X, Search, FileText, PencilLine } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

type CopyStatus = 'idle' | 'copied' | 'error'

// 유저가 이 화면을 로컬 개발 서버에서 보고 있어도, ChatGPT/Claude Desktop 등 외부 클라이언트에
// 붙여넣을 주소는 항상 실제로 접근 가능한 배포 도메인이어야 한다(localhost는 외부에서 접근 불가).
// OAuth redirect_uri 생성용 src/mcp/oauth.ts의 getAppOrigin()과 달리, 여기는 런타임 환경과
// 일치시킬 필요가 없으므로 NEXT_PUBLIC_APP_URL을 참조하지 않고 프로덕션 도메인을 그대로 고정한다.
const MCP_SERVER_URL = 'https://verilix.vercel.app/api/mcp'

interface McpGuideContentProps {
  lang: string
}

// 유저가 연결된 AI 도구의 개인화/맞춤지침/저장된 정보(=그 서비스의 "메모리") 칸에 그대로 붙여넣는 문장.
// 매 대화에서 따로 부탁하지 않아도 지식 베이스를 먼저 확인하고 정리하도록 유도하는 상시 지침.
const PERSONALIZATION_PROMPT_KO =
  'verilix 지식 베이스가 연결되어 있으면 적극 활용하라. 새 주제로 대화를 시작하거나 내 배경 정보가 필요할 때는 먼저 지식 베이스를 검색해 내 컨텍스트를 확인하고, 정리해둘 만한 결론·지식이 나오면 문서로 저장하고, 오래되거나 어긋난 문서는 갱신·재분류해 지식 베이스를 정돈된 상태로 유지하라.'
const PERSONALIZATION_PROMPT_EN =
  'If the verilix knowledge base is connected, use it actively. Before starting a new topic or whenever you need background about me, search it first to check my context; save any durable conclusions or knowledge as documents; and keep it tidy by updating or refiling stale or conflicting documents.'

export default function McpGuideContent({ lang }: McpGuideContentProps) {
  const isKo = lang === 'ko'
  const personalizationPrompt = isKo ? PERSONALIZATION_PROMPT_KO : PERSONALIZATION_PROMPT_EN
  const [urlCopyState, setUrlCopyState] = useState<CopyStatus>('idle')
  const [promptCopyState, setPromptCopyState] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (urlCopyState === 'idle') return
    const timer = setTimeout(() => setUrlCopyState('idle'), 1500)
    return () => clearTimeout(timer)
  }, [urlCopyState])

  useEffect(() => {
    if (promptCopyState === 'idle') return
    const timer = setTimeout(() => setPromptCopyState('idle'), 1500)
    return () => clearTimeout(timer)
  }, [promptCopyState])

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(MCP_SERVER_URL)
    setUrlCopyState(ok ? 'copied' : 'error')
  }

  const handleCopyPrompt = async () => {
    const ok = await copyToClipboard(personalizationPrompt)
    setPromptCopyState(ok ? 'copied' : 'error')
  }

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {isKo
          ? 'ChatGPT, Claude, Gemini 등 평소 즐겨 쓰는 대화형 AI 도구를 verilix 지식 베이스에 연결하세요. 연결하면 그 대화에서 지식 베이스를 검색·저장하고, 문서를 정리하는 것까지 맡길 수 있습니다.'
          : 'Connect the AI tool you already use — ChatGPT, Claude, Gemini, etc. — to your verilix knowledge base. Once connected, it can search and save to it, and help you keep it organized.'}
      </p>

      <section
        className="p-4 rounded-md"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          {isKo ? 'MCP 서버 URL' : 'MCP server URL'}
        </p>
        <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
          {isKo ? '커넥터 설정 화면에 이 주소를 입력하세요.' : 'Enter this address in the connector setup screen.'}
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 text-sm px-3 py-2 overflow-x-auto whitespace-nowrap select-text rounded-sm"
            style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            {MCP_SERVER_URL}
          </code>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="p-2 rounded-sm cursor-pointer shrink-0"
            style={{ color: urlCopyState === 'error' ? 'var(--destructive)' : 'var(--secondary)' }}
            title={isKo ? '복사' : 'Copy'}
          >
            {urlCopyState === 'copied' ? (
              <Check className="w-4 h-4" />
            ) : urlCopyState === 'error' ? (
              <X className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div
          className="p-4 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {isKo ? 'ChatGPT (커스텀 커넥터)' : 'ChatGPT (custom connector)'}
          </p>
          <p className="text-xs mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? 'OAuth 로그인 — 키 복사 필요 없음' : 'OAuth login — no key copy-paste needed'}
          </p>
          <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-1" style={{ color: 'var(--neutral)' }}>
            {isKo ? (
              <>
                <li>ChatGPT에서 설정 → 커넥터(Connectors) → "커넥터 만들기(Create)"로 이동합니다.</li>
                <li>이름은 자유롭게(예: verilix), 서버 URL엔 위에서 복사한 주소를 붙여넣습니다.</li>
                <li>인증 방식은 "OAuth"를 선택하고 저장합니다.</li>
                <li>연결을 누르면 로그인 창이 뜹니다 — verilix 계정(구글)으로 로그인하면 바로 연결됩니다.</li>
              </>
            ) : (
              <>
                <li>In ChatGPT, go to Settings → Connectors → "Create".</li>
                <li>Give it any name (e.g. verilix) and paste the server URL you copied above.</li>
                <li>Choose "OAuth" as the authentication method and save.</li>
                <li>Click Connect — a login window opens. Sign in with your verilix (Google) account and you're connected.</li>
              </>
            )}
          </ol>
        </div>

        <div
          className="p-4 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {isKo ? 'Claude (Desktop / Claude.ai)' : 'Claude (Desktop / Claude.ai)'}
          </p>
          <p className="text-xs mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? 'OAuth 로그인 — 키 복사 필요 없음' : 'OAuth login — no key copy-paste needed'}
          </p>
          <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-1" style={{ color: 'var(--neutral)' }}>
            {isKo ? (
              <>
                <li>설정 → 커넥터(Connectors) → "커넥터 추가(Add connector)"로 이동합니다.</li>
                <li>서버 URL 입력란에 위에서 복사한 주소를 붙여넣고 추가합니다.</li>
                <li>로그인 창이 뜨면 verilix 계정(구글)으로 로그인합니다 — 완료되면 바로 대화에서 사용할 수 있습니다.</li>
              </>
            ) : (
              <>
                <li>Go to Settings → Connectors → "Add connector".</li>
                <li>Paste the server URL you copied above and add it.</li>
                <li>A login window opens — sign in with your verilix (Google) account, and it's ready to use in your chats.</li>
              </>
            )}
          </ol>
        </div>

        <div
          className="p-4 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {isKo ? '그 외 — 설정 파일에 직접 입력하는 클라이언트' : 'Others — clients configured via a JSON file'}
          </p>
          <p className="text-xs mb-2" style={{ color: 'var(--neutral)' }}>
            {isKo ? 'API 키 방식 — 아래에서 키를 먼저 발급하세요' : 'API key — issue a key below first'}
          </p>
          <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-1.5" style={{ color: 'var(--neutral)' }}>
            {isKo ? (
              <>
                <li>이 화면 아래(또는 좌측 목록)의 "새 키 발급"으로 API 키를 하나 만들고 복사해둡니다 — 키는 발급 시 1회만 보이니 꼭 지금 복사하세요.</li>
                <li>클라이언트의 MCP 설정 파일을 열고, 서버 URL과 방금 발급한 키를 Authorization 헤더에 Bearer 토큰으로 넣습니다. 대부분 아래와 비슷한 형태입니다.</li>
              </>
            ) : (
              <>
                <li>Below (or in the list on the left), issue a new API key and copy it — it's only ever shown once, so copy it now.</li>
                <li>Open the client's MCP config file and add the server URL with the key as a Bearer token in the Authorization header. It usually looks something like this:</li>
              </>
            )}
          </ol>
          <pre
            className="mt-2 text-xs px-3 py-2 overflow-x-auto rounded-sm"
            style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
{`{
  "mcpServers": {
    "verilix": {
      "url": "${MCP_SERVER_URL}",
      "headers": {
        "Authorization": "Bearer ${isKo ? '<발급받은 키>' : '<your issued key>'}"
      }
    }
  }
}`}
          </pre>
          <p className="text-xs mt-1.5" style={{ color: 'var(--neutral)' }}>
            {isKo
              ? '정확한 필드명(headers/customHeaders 등)은 클라이언트마다 다를 수 있으니, 해당 클라이언트의 MCP 연결 문서를 함께 참고하세요.'
              : "Exact field names (headers/customHeaders, etc.) vary by client — check that client's own MCP connection docs alongside this."}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--neutral)' }}>
          {isKo ? '연결하면 할 수 있는 것' : 'What you can do once connected'}
        </p>
        <div
          className="flex items-start gap-3 p-3 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isKo
              ? '지식 베이스 검색 — 저장해둔 문서 중 지금 나누는 대화와 관련된 내용을 찾아옵니다.'
              : 'Search the knowledge base — finds documents relevant to your current conversation.'}
          </p>
        </div>
        <div
          className="flex items-start gap-3 p-3 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isKo
              ? '문서 생성/저장 — 지금 나눈 대화를 verilix 지식 베이스에 문서로 저장합니다.'
              : 'Create/save documents — saves your conversation to the verilix knowledge base as a document.'}
          </p>
        </div>
        <div
          className="flex items-start gap-3 p-3 rounded-md"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <PencilLine className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isKo
              ? '문서 정리 — 전체 목록을 훑고, 문서를 편집·이름변경·태그/카테고리/폴더 재분류하고, 삭제한 문서는 버전 기록으로 되돌릴 수 있습니다.'
              : 'Curate the library — browse the full list, edit / rename / recategorize / refile documents, and roll back or undelete via version history.'}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--neutral)' }}>
          {isKo ? '팁 — AI 도구가 알아서 쓰게 하기' : 'Tip — let your AI tool use it on its own'}
        </p>
        <div
          className="p-4 rounded-md space-y-3"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--neutral)' }}>
            {isKo
              ? '아래 문장을 ChatGPT·Claude·Gemini 등의 개인화 설정(맞춤 지침·개인 환경설정·저장된 정보) 칸에 넣어두세요. 그 도구의 메모리에 남아, 매 대화에서 따로 부탁하지 않아도 verilix 지식 베이스를 먼저 확인하고 정리해둡니다.'
              : "Paste the sentence below into your AI tool's personalization field (custom instructions / personal preferences / saved info) in ChatGPT, Claude, Gemini, etc. It stays in that tool's memory, so every conversation checks and maintains your verilix knowledge base without being asked each time."}
          </p>
          <div className="flex items-start gap-2">
            <p
              className="flex-1 text-sm px-3 py-2 whitespace-pre-wrap select-text rounded-sm leading-relaxed"
              style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              {personalizationPrompt}
            </p>
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="p-2 rounded-sm cursor-pointer shrink-0"
              style={{ color: promptCopyState === 'error' ? 'var(--destructive)' : 'var(--secondary)' }}
              title={isKo ? '복사' : 'Copy'}
            >
              {promptCopyState === 'copied' ? (
                <Check className="w-4 h-4" />
              ) : promptCopyState === 'error' ? (
                <X className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

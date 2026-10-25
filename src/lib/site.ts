// SEO 공용 상수. 도메인을 바꾸면 여기만 고치면 된다.
export const SITE_URL = 'https://verilix.vercel.app'
export const LOCALES = ['ko', 'en'] as const

export const SITE_COPY = {
  ko: {
    title: 'verilix: MCP로 쌓는 AI 지식 베이스',
    description:
      'ChatGPT·Claude·Gemini 등 평소 쓰는 AI를 MCP로 연결하세요. 나눈 대화가 구조화된 문서로 정리되어 쌓이고, 다음 대화엔 필요한 지식만 골라 이어집니다. 무료.',
    keywords: [
      'verilix', '베리릭스', 'MCP', 'MCP 서버', 'AI 지식 베이스', 'AI 메모리',
      'ChatGPT 메모리', 'Claude 메모리', '개인 지식 관리', '세컨드 브레인', 'AI 대화 정리',
    ],
    locale: 'ko_KR',
  },
  en: {
    title: 'verilix: AI knowledge base for MCP',
    description:
      'Connect the AI tools you already use — ChatGPT, Claude, Gemini — via MCP. Conversations are distilled into structured notes that build up, and only what is relevant flows into the next one. Free.',
    keywords: [
      'verilix', 'MCP server', 'AI knowledge base', 'AI memory', 'ChatGPT memory',
      'Claude memory', 'personal knowledge management', 'second brain', 'Model Context Protocol',
    ],
    locale: 'en_US',
  },
} as const

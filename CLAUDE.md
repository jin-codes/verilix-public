This is NOT the Next.js you know.
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data.
Read the relevant guide in node_modules/next/dist/docs/ before writing any code. Heed deprecation notices.

디자인 토큰은 `DESIGN_TOKENS.md`를 따를 것.
`tokens.ts`는 이 문서의 값을 코드로 그대로 옮긴 참고용 미러이며, 실제 Tailwind 구현은 `src/app/globals.css`의 `@theme`/`:root`(light)/`.dark`(dark) CSS 변수다 (Tailwind v4는 `@config` 없이 JS config를 로드하지 않으므로 `tailwind.config.ts`는 존재하지 않음).
값이 어긋나면 항상 `DESIGN_TOKENS.md`가 진실이다. 임의 색상 변경 절대 금지.

나의 말이 늘 옳은 것은 아니며, 특히 이러한 코딩 작업에서는 지적하는 것이 더욱 중요하므로 기술적으로 틀린 말일 경우 내 말을 두둔/실행하려 들지 말고 바로 지적하고 내 원래 의도를 생각해서 작업하라.
또한 localhost:3000으로 확인하는것은 내가 할 것이니 직접 하려 하지않아도 된다.
작업이 완료되면 체크리스트/주석을 자주 남겨라. 또한 커밋/푸시도 하라. 작업 완료가 확인되었을때.



---

# Verilix

## 서비스 한 줄 정의
**MCP로 연결된 AI(ChatGPT/Claude/Gemini 등)와의 대화를 구조화된 문서로 쌓아, 다음 대화를 더 깊게 만드는 개인 지식 베이스.**

## 핵심 루프
연결된 AI와 대화 → 구조화된 문서로 저장 → 지식 베이스 축적 → 검색(의미 + 단어)으로 관련 문서 선별 → 다음 대화의 컨텍스트로 주입 → 반복

## 제품 범위
- **MCP 서버** — 외부 AI가 툴 호출로 지식 베이스를 검색·저장·정리 (`/api/mcp`)
- **웹 문서 뷰어** — 문서 목록/상세/편집, 태그 필터, 검색, 지식 지도(마인드맵)
- **주간 다이제스트** — 이번 주 쌓인 문서·관심사 변화·모순을 요약해 메일 발송
- (과거에 있던 자체 웹 채팅은 제거됨. DB 테이블만 보존)

## 핵심 UX 원칙
1. **고정 네비게이션** — 자연어 커맨드바/자동 서피싱 패널 없음. 모든 액션은 버튼/메뉴/클릭 같은 명시적 UI 조작.
2. **웹 UI와 MCP는 대등한 진입점** — 같은 지식 베이스를 웹에서 브라우징하거나, 외부 AI에서 MCP 툴로 다룬다.
3. 2단 셸: 1열 = 접이식 목록 패널(상단 모드 탭 `MCP`/`지식 베이스` + 목록 + 계정 푸터), 2열 = 선택 항목 상세. 모바일은 탭바 + 목록↔상세 스택으로 재구성.

---

## 기술 스택
Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 + shadcn/ui · Supabase (Postgres + pgvector + RLS + Auth) · Anthropic API (문서 분류·다이제스트) · Gemini Embeddings (`gemini-embedding-001`, 768차원) · Nodemailer(SMTP) · Vercel (Cron 포함)

다국어(ko/en)는 자체 구현: `src/proxy.ts`가 locale을 감지해 `/[lang]/...`로 리다이렉트.

## 폴더 구조
```
src/
├── proxy.ts               # locale 리다이렉트 (matcher에서 /auth, /api, /.well-known 제외)
├── app/
│   ├── [lang]/            # 랜딩, login, onboarding, mcp, notes, settings, admin, demo
│   ├── api/
│   │   ├── [transport]/   # MCP 서버 마운트 (/api/mcp)
│   │   ├── mcp/oauth/     # OAuth: register(DCR) / authorize(동의 화면) / token
│   │   ├── documents/     # 검색·편집·온보딩 문서 생성
│   │   ├── settings/byok/ # 사용자 API 키(암호화 저장)
│   │   ├── cron/          # 주간 다이제스트
│   │   └── account/       # 계정 탈퇴
│   ├── auth/callback/     # OAuth 콜백 — locale 밖에 둔다(Supabase Redirect URL과 1:1)
│   └── .well-known/       # OAuth discovery (RFC 8414 / 9728)
├── components/            # landing, notes, mcp, settings, layout, admin, shared, ui
├── mcp/                   # MCP 서버: server.ts, auth.ts, oauth.ts, tools/*
└── lib/
    ├── supabase/          # client(브라우저) / server(세션) / admin(service role, 서버 전용)
    ├── ai/                # 문서 생성·다이제스트·임베딩·태그 어휘·BYOK 암호화
    └── demo/              # 비공개 데모용 정적 데이터
supabase/migrations/       # 스키마·RLS·함수 (순서대로 적용)
```

## MCP 서버
Streamable HTTP(`mcp-handler`)로 마운트. 툴: `search_knowledge` `save_document` `list_documents` `edit_document` `delete_document`(휴지통) `restore_document` `document_history` `link_documents` `list_categories` `manage_category` `manage_folder` `log_note`.

- **인증 두 갈래**: `vlx_` 접두사 API 키(SHA-256 해시만 저장) / OAuth 액세스 토큰(`vlxo_`, 해시 저장). 둘 다 서비스 롤로 검증하고 `userId`를 툴에 전달한다.
- **OAuth**: authorization_code + PKCE(S256), Dynamic Client Registration, refresh 토큰 회전. `/authorize`는 동의 화면(GET) → 허용 시에만 코드 발급(POST, Origin 검사).
- **문서는 git처럼 버전 관리**: 수정/삭제/링크 변경 전 상태를 `document_versions`에 스냅샷 + 커밋 메시지로 남기고, 삭제는 `is_archived` 소프트 삭제라 `restore_document`로 되돌릴 수 있다.
- **검색**: 의미 검색(pgvector `match_documents`)과 단어 검색(`search_documents_text`, tsvector + 부분 문자열)을 함께 실행해 병합.

## 데이터 모델 (요약)
`profiles` · `documents`(+`document_versions`) · `folders` · `tag_nodes`(카테고리 트리) · `topic_insights`/`assistant_notes`(태그별 개인화 분석) · `mcp_api_keys` · `mcp_oauth_{clients,codes,tokens}` · `mcp_usage_logs` · `user_api_keys`(BYOK, AES-256-GCM) · `digest_snapshots` · `user_feedback`. 모든 테이블 RLS 활성화(본인 데이터만). 자세한 컬럼은 `supabase/migrations/`가 원본이다.

---

## 보안 모델 (변경 시 반드시 지킬 것)
- **RLS는 기본 방어선**이다. 브라우저 세션(anon/authenticated)은 항상 RLS 아래에서만 동작한다.
- **service role 클라이언트(`lib/supabase/admin.ts`, `mcp/auth.ts`)는 서버 코드에서만**, 그리고 `user_id`를 직접 검증한 뒤에만 쓴다. `/admin` 하위는 `requireAdmin()` 게이트를 통과해야 한다.
- **`security definer` 함수는 권한을 명시적으로 회수한다.** `revoke ... from public`만으로는 부족하다 — 프로젝트의 기본 권한이 `anon`/`authenticated`에 직접 부여돼 있어 `revoke ... from anon, authenticated`까지 해야 한다. 새 함수는 필요한 롤에만 `grant execute` 한다(기본 권한은 회수해 둠).
- **`profiles`의 권한 컬럼**(`is_admin`, `plan`, `credits_*`, `email`)은 트리거가 클라이언트 세션의 변경을 거부한다. RLS만으로는 컬럼 단위 보호가 안 된다.
- **비밀값은 코드/문서/마이그레이션에 넣지 않는다.** 환경변수로만 주입하고 `.env*`는 커밋하지 않는다. 크론은 `CRON_SECRET`이 없으면 열지 않고 막는다(fail closed).
- **OAuth**: redirect_uri 정확 일치, PKCE 필수, 동의 화면은 프레임 삽입 금지 + 신뢰할 수 없는 문자열(`client_name`) 이스케이프, 코드/리프레시 토큰은 조건부 update로 단일 사용 보장.
- 이 저장소에 취약점을 발견하면 공개 이슈 대신 저장소 소유자에게 직접 알려 달라.

---

## 개발 컨벤션
- `@/*` → `src/*`. Supabase 클라이언트는 `lib/supabase/{client,server}.ts`만 사용(루트에 별도 파일 금지).
- **색상 hex 리터럴 금지** — `var(--토큰)` 또는 토큰 클래스만 쓴다(라이트/다크 자동 전환). radius도 토큰 클래스(`rounded-sm/md/lg`)만 쓴다.
- `localStorage`/`window` 크기에 의존하는 셸은 `next/dynamic(..., { ssr: false })`로 감싼 얇은 클라이언트 컴포넌트를 거쳐 하이드레이션 불일치를 피한다(`*-page-client.tsx` 패턴).
- 클립보드 복사는 `lib/utils.ts`의 `copyToClipboard()`(secure context 폴백 포함)를 쓴다.
- 서버/클라이언트에서 같은 문자열을 렌더할 때 `toLocaleString()`처럼 타임존에 의존하는 API는 피한다(하이드레이션 불일치).
- 임베딩 프로바이더/모델을 바꾸면 검색 유사도 문턱(`SIMILARITY_THRESHOLD`)을 무관/연관 쌍으로 실측해 다시 맞춘다. 모델마다 baseline이 다르다.
- 마이그레이션은 새 파일로만 추가한다(적용된 파일 수정 금지, 비밀값/개인 이메일 하드코딩 금지).

## 개발 시작
```bash
cp .env.example .env.local   # 값 채우기
npm install
npm run dev                  # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build
```
환경변수 목록은 `.env.example` 참고. Supabase 프로젝트에 `supabase/migrations/`를 순서대로 적용해야 한다.

## 상태
- [x] MCP 서버(검색/저장/편집/버전/폴더/카테고리/링크) + OAuth(동의 화면)
- [x] 문서 뷰어(목록/상세/편집/검색/태그 필터/지식 지도), 모바일 반응형
- [x] 주간 다이제스트(관심사 변화·모순 감지), 다크모드, 랜딩
- [ ] MCP 전용 과금 체계, 결제 연동, 이메일 내보내기

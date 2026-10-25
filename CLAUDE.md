[한국어](CLAUDE.ko.md) · **English**

Follow `DESIGN_TOKENS.md` for design tokens.
`tokens.ts` is a reference mirror of that document's values. The real Tailwind implementation is the `@theme` / `:root` (light) / `.dark` (dark) CSS variables in `src/app/globals.css` (Tailwind v4 does not load a JS config without `@config`, so there is no `tailwind.config.ts`).
If values disagree, `DESIGN_TOKENS.md` is the source of truth. Never change colors arbitrarily.



---

# Verilix

## One-line definition
**A personal knowledge base that turns conversations with MCP-connected AI (ChatGPT / Claude / Gemini, etc.) into structured documents, so the next conversation goes deeper.**

## Core loop
Talk to a connected AI → save as a structured document → knowledge base grows → hybrid search (semantic + word) picks relevant documents → inject as context for the next conversation → repeat

## Product scope
- **MCP server** — external AI searches, saves, and organizes the knowledge base through tool calls (`/api/mcp`)
- **Web document viewer** — document list / detail / edit, tag filter, search, knowledge map (mind map)
- **Weekly digest** — an email summarizing this week's new documents, interest shifts, and contradictions
- (The former built-in web chat was removed; only its DB tables are kept.)

## Core UX principles
1. **Fixed navigation** — no natural-language command bar or auto-surfacing panel. Every action is an explicit UI operation: a button, menu, or click.
2. **The web UI and MCP are equal entry points** — the same knowledge base can be browsed on the web or used from an external AI via MCP tools.
3. Two-column shell: column 1 = collapsible list panel (mode tabs `MCP` / `Knowledge base` on top, then the list, then an account footer), column 2 = detail of the selected item. On mobile this becomes a tab bar plus a list ↔ detail stack.

---

## Tech stack
Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 + shadcn/ui · Supabase (Postgres + pgvector + RLS + Auth) · Anthropic API (document classification, digest) · Gemini Embeddings (`gemini-embedding-001`, 768 dims) · Nodemailer (SMTP) · Vercel (including Cron)

i18n (ko/en) is custom: `src/proxy.ts` detects the locale and redirects to `/[lang]/...`.

## Folder structure
```
src/
├── proxy.ts               # locale redirect (matcher excludes /auth, /api, /.well-known)
├── app/
│   ├── [lang]/            # landing, login, onboarding, mcp, notes, settings, admin, demo
│   ├── api/
│   │   ├── [transport]/   # MCP server mount (/api/mcp)
│   │   ├── mcp/oauth/     # OAuth: register (DCR) / authorize (consent screen) / token
│   │   ├── documents/     # search, edit, onboarding document creation
│   │   ├── settings/byok/ # user API keys (stored encrypted)
│   │   ├── cron/          # weekly digest
│   │   └── account/       # account deletion
│   ├── auth/callback/     # OAuth callback — kept outside [lang] (1:1 with the Supabase Redirect URL)
│   └── .well-known/       # OAuth discovery (RFC 8414 / 9728)
├── components/            # landing, notes, mcp, settings, layout, admin, shared, ui
├── mcp/                   # MCP server: server.ts, auth.ts, oauth.ts, tools/*
└── lib/
    ├── supabase/          # client (browser) / server (session) / admin (service role, server only)
    ├── ai/                # document generation, digest, embeddings, tag vocabulary, BYOK encryption
    └── demo/              # static data for the demo page
supabase/migrations/       # schema, RLS, functions (apply in order)
```

## MCP server
Mounted over Streamable HTTP (`mcp-handler`). Tools: `search_knowledge` `save_document` `list_documents` `edit_document` `delete_document` (moves to trash) `restore_document` `document_history` `link_documents` `list_categories` `manage_category` `manage_folder` `list_folders` `log_note`.

- **Two auth paths**: API keys with the `vlx_` prefix (only the SHA-256 hash is stored) and OAuth access tokens (`vlxo_`, hash stored). Both are verified with the service role, and `userId` is passed to the tools.
- **OAuth**: authorization_code + PKCE (S256), Dynamic Client Registration, refresh-token rotation. `/authorize` shows a consent screen (GET) and issues a code only on approval (POST, Origin check).
- **Documents are versioned like git**: the previous state is snapshotted into `document_versions` with a commit message before any edit, delete, or link change. Deletes are soft (`is_archived`), so `restore_document` can undo them.
- **Search**: semantic search (pgvector `match_documents`) and word search (`search_documents_text`, tsvector + substring) run together and are merged.

## Data model (summary)
`profiles` · `documents` (+ `document_versions`) · `folders` · `tag_nodes` (category tree) · `topic_insights` / `assistant_notes` (per-tag personalization analysis) · `mcp_api_keys` · `mcp_oauth_{clients,codes,tokens}` · `mcp_usage_logs` · `user_api_keys` (BYOK, AES-256-GCM) · `digest_snapshots` · `user_feedback`. RLS is enabled on every table (own data only). `supabase/migrations/` is the source of truth for columns.

---

## Security model (must be preserved when changing code)
- **RLS is the primary line of defense.** Browser sessions (anon / authenticated) always run under RLS.
- **Service-role clients (`lib/supabase/admin.ts`, `mcp/auth.ts`) are server-only**, and are used only after verifying `user_id` directly. Everything under `/admin` must pass the `requireAdmin()` gate.
- **`security definer` functions have their privileges revoked explicitly.** `revoke ... from public` is not enough — the project's default privileges grant directly to `anon` / `authenticated`, so you must also `revoke ... from anon, authenticated`. New functions get `grant execute` only for the roles that need it (default privileges have been revoked).
- **Privileged `profiles` columns** (`is_admin`, `plan`, `credits_*`, `email`) are protected by a trigger that rejects changes from client sessions. RLS alone cannot protect individual columns.
- **No secrets in code, docs, or migrations.** Inject them via environment variables only and never commit `.env*`. The cron endpoint fails closed: it stays shut when `CRON_SECRET` is unset.
- **OAuth**: exact `redirect_uri` match, PKCE required; the consent screen forbids framing and escapes untrusted strings (`client_name`); authorization codes and refresh tokens are guaranteed single-use through conditional updates.
- If you find a vulnerability in this repository, please tell the owner directly instead of opening a public issue.

---

## Development conventions
- `@/*` → `src/*`. Use only `lib/supabase/{client,server}.ts` for Supabase clients (no separate files at the repo root).
- **No hex color literals** — use `var(--token)` or token classes only (switches automatically between light and dark). Use only token classes for radius too (`rounded-sm/md/lg`).
- A shell that depends on `localStorage` / `window` size goes through a thin client component wrapped in `next/dynamic(..., { ssr: false })` to avoid hydration mismatches (the `*-page-client.tsx` pattern).
- Use `copyToClipboard()` from `lib/utils.ts` for clipboard copies (it includes a fallback for non-secure contexts).
- When rendering the same string on server and client, avoid timezone-dependent APIs such as `toLocaleString()` (hydration mismatch).
- If you change the embedding provider or model, re-measure the search similarity threshold (`SIMILARITY_THRESHOLD`) with unrelated and related pairs. Each model has a different baseline.
- Add migrations only as new files (never edit an applied file; never hardcode secrets or personal emails).

## Getting started
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
npx tsc --noEmit && npm run lint && npm run build
```
See `.env.example` for the environment variables. Apply `supabase/migrations/` to your Supabase project in order.

## Status
- [x] MCP server (search / save / edit / versions / folders / categories / links) + OAuth (consent screen)
- [x] Document viewer (list / detail / edit / search / tag filter / knowledge map), mobile responsive
- [x] Weekly digest (interest shifts, contradiction detection), dark mode, landing page
- [ ] MCP-specific billing, payment integration, email export

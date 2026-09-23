# verilix

**English** · [한국어](README.ko.md)

**A personal knowledge base that plugs into the AI tools you already use (ChatGPT · Claude · Gemini) via MCP — turning your conversations into structured documents that make the next conversation deeper.**

> Connect the AI you already use. The conclusions of your conversations are saved as documents, and those documents build up into context for the next one.

**Live site**: https://verilix.vercel.app · **Demo (fictional data)**: https://verilix.vercel.app/en/demo/notes

## Screenshots
![Landing page — hero with a knowledge graph that reacts to the mouse](docs/screenshots/landing-hero.webp)

| Landing — library overview | Knowledge map |
|---|---|
| ![Feature cards on the landing page](docs/screenshots/landing-library.webp) | ![Knowledge map showing categories and documents radially](docs/screenshots/knowledge-map.webp) |

## Features
- **MCP server** — 12 tools (search, save, edit, delete/restore, version history, link, categories, folders). Connect with OAuth (PKCE + consent screen) or an API key
- **Git-style document versioning** — every edit or delete snapshots the previous state with a commit message; deletes are soft, and any version can be restored
- **Hybrid search** — semantic search (pgvector) plus word search (tsvector / substring)
- **Knowledge map** — categories, documents, and links between related documents drawn as a radial graph
- **Weekly digest** — an email summarizing interest shifts (computed on the server) and contradictions with existing notes
- Dark mode, Korean/English, responsive on mobile

## Tech stack
Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, pgvector, RLS, Auth) · Anthropic API · Gemini Embeddings · Vercel

## Design highlights
- **RLS-first security**: RLS on every table; the service role is server-only and used only after ownership checks. Privileged columns are protected by a trigger, and `security definer` functions have their execute rights explicitly revoked. See the "보안 모델" (security model) section of [CLAUDE.md](CLAUDE.md) (written in Korean)
- **Hand-built OAuth**: RFC 7591 (DCR) / 8414 / 9728 / PKCE, a consent screen with CSRF, clickjacking and XSS defenses, and single-use guarantees for authorization codes and refresh tokens
- **Deterministic server, LLM only narrates**: digest trends are computed by the server from snapshot diffs; the LLM only writes the explanation

## Getting started
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run dev
```
Apply `supabase/migrations/` to your Supabase project in order.

## License
No license is granted. This repository is public for portfolio viewing only; copying, redistribution, and commercial use are not permitted without permission (all rights reserved).

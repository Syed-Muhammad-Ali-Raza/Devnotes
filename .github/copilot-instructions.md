# GitHub Copilot instructions for Devnotes

These rules keep Copilot consistent with the same conventions used by opencode (AGENTS.md), Cursor/Claude Code/Antigravity (.cursorrules), and Claude Code (.claude/settings.json).

## Stack

Next.js 14 App Router, React 18, TypeScript (strict), Tailwind 3.4, lucide-react, react-markdown.
Supabase: Auth (GitHub OAuth), Postgres, RLS, Realtime, `@supabase/ssr`.

## Ground rules

1. TypeScript stays strict. No new `any` unless a Supabase join forces a narrow `unknown` cast.
2. Zinc / black / white visual language only. Never introduce a second brand color.
3. Prefer Server Components. Add `'use client'` only when the UI needs browser state.
4. Schema changes go in an append-only `PHASE N` block at the bottom of `supabase-schema.sql`. Never rewrite Phase 1–4 history.
5. Never suggest committing `.env.local`, secrets, or Supabase keys.
6. RLS-safe: a second logged-in user must never see another author's drafts or private bookmarks.

## Data access

- Server data fetching → `createServerSupabase()` from `lib/supabaseServer.ts`.
- Browser mutations → `createClient()` from `lib/supabaseClient.ts`.
- Protected routes must be added to `middleware.ts`.
- After publish / delete / comment / like, call `/api/revalidate` for stale paths.
- Optimistic UI must roll back on Supabase errors.
- Shared shapes in `lib/types.ts`. Icons from `lucide-react`.

## Styling

Use stock Tailwind `zinc`/`black`/`white`/`gray`. Avoid non-standard classes (`border-zinc-150`, `bg-zinc-150`, `border-zinc-250`, `text-zinc-955`, `h-8.5`, `w-6.5`) — use valid scale values or arbitrary values.

## Roadmap

Done: Phases 1–4. Next: Phase 5 Media Desk, Phase 6 Writer Craft, Phase 7 Series & Digest. Follow `PLANNING.md`.

## Verification

Run `npx tsc --noEmit` and `npm run lint` before finishing.

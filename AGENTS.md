# Devnotes — Agent Conventions

This file is loaded by AI coding tools (opencode reads it via `instructions`).
It is the single source of truth for how agents should work in this repo.
Read `PLANNING.md`, `CONTRIBUTING.md`, and `documentation.md` for full context.

---

## Stack

- Next.js 14 App Router, React 18, TypeScript (strict), Tailwind CSS 3.4, lucide-react, react-markdown.
- Supabase: Auth (GitHub OAuth), Postgres, RLS, Realtime, `@supabase/ssr`.

---

## Ground Rules (non-negotiable)

1. **TypeScript stays strict.** No new `any` unless a Supabase join forces a narrow `unknown` cast.
2. **Zinc / black / white visual language only.** Never introduce a second brand color.
3. **Prefer Server Components.** Add `'use client'` only when the UI needs browser state.
4. **Schema changes go in an append-only `PHASE N` block** at the bottom of `supabase-schema.sql`. Never rewrite Phase 1–4 history.
5. **Never commit `.env.local`, secrets, or Supabase keys.**
6. **RLS-safe:** a second logged-in user must never see another author's drafts or private bookmarks.

---

## Data access conventions

- **Server data fetching** → `createServerSupabase()` from `lib/supabaseServer.ts` (Server Components, route handlers).
- **Browser mutations** → `createClient()` from `lib/supabaseClient.ts` (`'use client'` components).
- **Protected routes** must be added to `middleware.ts` (currently: `/write`, `/dashboard`, `/settings`, `/bookmarks`, `/notifications`).
- **After publish / delete / comment / like**, call `/api/revalidate` for the paths that would otherwise stay stale (feed, dashboard, post slug, profile).
- **Optimistic UI must roll back on Supabase errors**, same as `LikeButton` and `FollowButton`.
- Shared shapes live in `lib/types.ts`.

---

## Styling notes

- Use Tailwind's default `zinc` / `black` / `white` / `gray` palette. The site is intentionally quiet — no chrome, no dashboard clutter.
- Some existing classes like `border-zinc-150`, `bg-zinc-150`, `border-zinc-250`, `text-zinc-955`, `h-8.5`, `w-6.5` are **non-standard** and will not generate utilities with the stock Tailwind config. Replace them with valid scale values (e.g. `zinc-100`/`zinc-200`, or arbitrary `h-[34px]`) when you touch them.

---

## Roadmap context

- **Completed:** Phases 1–4 (foundation, engagement, discovery, community graph).
- **Next up:** Phase 5 Media Desk (Supabase Storage covers/avatars), Phase 6 Writer Craft (Draft|Preview panes, autosave, `series_slug`), Phase 7 Series & Sunday Digest.
- Follow `PLANNING.md` step-by-step. The "unique delivery steps" are the contract for each phase.

---

## Agent infrastructure

This repo is configured for several AI coding tools so conventions stay consistent everywhere:

- **opencode** — config `opencode.json`; agents in `.opencode/agent/*.md` (`backend-engineer`, `frontend-engineer`, `db-reviewer`); skills in `.opencode/skills/*/SKILL.md` (supabase, nextjs-app-router, tailwind-zinc-styling, devnotes-project); commands in `.opencode/command/*.md` and inline.
- **Cursor / Claude Code / Antigravity** — `./.cursorrules` carries the same conventions.
- **Claude Code** — `./.claude/settings.json` points it at `AGENTS.md`.
- **GitHub Copilot** — `./.github/copilot-instructions.md`.

When you change `opencode.json`, an agent, a skill, or a command file, restart opencode — config is loaded once at startup. Keep the cross-tool files in sync with this file.

---

## Verification

Before finishing a task, run from the repo root:
- `npx tsc --noEmit` (desk-check requirement)
- `npm run lint` (Next.js linter)

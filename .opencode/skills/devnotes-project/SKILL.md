---
name: devnotes-project
description: Use when starting any task in the Devnotes repo or when onboarding. Loads the product context: project identity, current phase, key files, conventions, and contribution protocol.
---

# Devnotes project orientation

Devnotes is a developer blogging platform: "a quiet writing desk for developers — fast to read, honest to write, and social only where it helps the story."

## North Star checks

Every feature must pass all three:

1. **Story-first** — does it help someone publish or discover a better technical story?
2. **RLS-safe** — can a second logged-in user never see another author's drafts or private bookmarks?
3. **Zinc-quiet UI** — no noisy chrome, no extra color systems, no dashboard clutter.

## What's done and what's next

- **Done:** Phases 1–4 (foundation, engagement, discovery, community graph).
- **Next up** (from `PLANNING.md`):
  - **Phase 5 Media Desk** — Supabase Storage covers/avatars (public `covers` + `avatars` buckets only; strict MIME allow-list; preview before publish).
  - **Phase 6 Writer Craft** — Draft|Preview panes, 20s autosave, `series_slug`, last-autosave on dashboard, no `published_at` change on unpublished edits.
  - **Phase 7 Series & Sunday Digest** — `/series/[slug]` shelf, series-first related posts, `/digest.xml`, per-story digest toggle, reserved `digest_drop` notification type.

Follow `PLANNING.md` step-by-step. The "unique delivery steps" are the contract for each phase.

## Key files

- `PLANNING.md` — product + engineering roadmap.
- `CONTRIBUTING.md` — the Unique Contributor Path and desk-check protocol.
- `documentation.md` — system spec, schema reference, user flows.
- `supabase-schema.sql` — append-only by phase block.
- `lib/types.ts` — shared row shapes.
- `middleware.ts` — auth route guard.

## Contribution protocol (condensed)

- Branch `phase-<n>/<short-kebab>`, `fix/<short-kebab>`, or `docs/<short-kebab>`; land on `dev`.
- Claim a `contrib_*` handle and publish a `Desk Check: <handle>` story before a PR.
- Run the Two-Tab Social Drill for social changes; do the TTS listen check for post rendering.
- Verify with `npx tsc --noEmit` and `npm run lint` before finishing.
- PR body uses the exact sections in `CONTRIBUTING.md` (Story / Desk Check / Schema Stamp / Routes Touched / Rollback).

## Out of scope (do not sneak in)

Multi-provider auth, paid subscriptions, admin moderation console, native mobile apps, AI-generated post bodies.

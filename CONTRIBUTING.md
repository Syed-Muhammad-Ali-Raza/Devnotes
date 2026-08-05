# Contributing to Devnotes

Thanks for helping build Devnotes. This is not a generic open-source checklist. Contributions should read, look, and behave like the rest of the writing desk.

Read [PLANNING.md](./PLANNING.md) before large work so the change lands in the right phase.

---

## Ground Rules

- TypeScript must stay strict. No new `any` unless a Supabase join forces a narrow `unknown` cast.
- Keep the zinc / black / white visual language. Do not introduce a second brand color.
- Prefer Server Components. Add `'use client'` only when the UI needs browser state.
- Schema changes belong in an append-only **PHASE N** block in `supabase-schema.sql`.
- Do not commit `.env.local`, secrets, or personal Supabase keys.

---

## Unique Contributor Path

Most repos ask you to fork, branch, and PR. Devnotes also requires a **local writing desk smoke test** so social features are proven with real stories, not empty tables.

### Step 1 — Fork the desk, not just the repo

1. Fork and clone the repository.
2. Create `.env.local` from `.env.local.example`.
3. Point it at **your own** Supabase project. Never use shared production keys in a contribution branch.

### Step 2 — Stamp your schema generation

1. Run the full `supabase-schema.sql` on a fresh Supabase project.
2. In the SQL editor, save the run as a snippet named `devnotes-phase-<n>`.
3. In **Database -> Replication**, confirm `comments` and `notifications` are in the `supabase_realtime` publication.
4. Record the generation in your PR: `Schema stamped: Phase 4` (or whichever phase you touched).

### Step 3 — Claim a handle before you code

1. Start the app with `npm run dev`.
2. Sign in with GitHub.
3. Open `/settings` and claim a handle that starts with `contrib_`, for example `contrib_aya`.
4. This keeps contributor accounts obvious in screenshots and review environments.

### Step 4 — Publish the First Story Protocol

Every contributor publishes one local story before opening a PR:

1. Go to `/write`.
2. Title it `Desk Check: <your handle>`.
3. Add tags `devnotes` and `contrib`.
4. Write at least 120 words of Markdown, including one fenced `ts` code block.
5. Publish it.
6. Confirm it appears on `/`, `/tags/devnotes`, `/sitemap.xml`, and `/feed.xml`.

PRs that change feed, search, tags, or SEO without this story will be asked to redo the desk check.

### Step 5 — Run the Two-Tab Social Drill

Social changes need two identities. Use a second GitHub user or an incognito session with another OAuth app test account.

| Tab A (`contrib_aya`) | Tab B (`contrib_neo`) |
|---|---|
| Publish or open a story | Like the story |
| Keep `/posts/[slug]` open | Leave a nested reply |
| Follow Tab B from the profile | Follow Tab A back |
| Save Tab B's story to the reading list | Confirm `/bookmarks` stays private |

Pass criteria:

- Tab A sees a like, comment, and follow notification without refreshing the full page.
- Tab B cannot open Tab A's drafts from `/dashboard` or guess a draft slug.
- Bookmarks never appear on public profiles.

### Step 6 — Listen to the story

Open the published post and use **Listen to this article**.

- Playback must start from the title.
- Fenced code blocks should be skipped or announced as skipped.
- Stop must cancel browser speech immediately.

Skip this step only if your change cannot touch post rendering or `TextToSpeech`.

### Step 7 — Branch like a phase, not a vibe

```bash
git checkout dev
git pull
git checkout -b phase-5/cover-upload
```

Branch names:

- `phase-<n>/<short-kebab>` for roadmap work
- `fix/<short-kebab>` for regressions
- `docs/<short-kebab>` for documentation-only changes

Do not open feature work directly against `production` unless you are merging a finished phase.

### Step 8 — Make the smallest honest diff

- One phase concern per PR.
- If you need a schema change, include the SQL block and the UI that uses it in the same PR.
- Update `README.md`, `documentation.md`, and `PLANNING.md` when behavior or tables change.
- Keep components typed. Shared shapes live in `lib/types.ts`.

### Step 9 — Prove the desk is still quiet

From the repo root:

```bash
npx tsc --noEmit
```

Then click through this short route tour:

1. `/` Latest and `/` Following
2. `/write` draft save + publish
3. `/dashboard` edit + delete
4. `/settings` handle validation
5. `/search?q=desk`
6. `/notifications` and `/bookmarks`
7. `/@contrib_aya`

### Step 10 — Write the PR as a Devnote

Title format:

```text
feat(phase-5): upload story covers to Supabase Storage
```

PR body must include these exact sections:

```markdown
## Story
What reader or writer problem does this change solve?

## Desk Check
- [ ] Claimed a `contrib_*` handle
- [ ] Published `Desk Check: <handle>`
- [ ] Two-Tab Social Drill passed (or N/A: <reason>)
- [ ] TTS listen check passed (or N/A: <reason>)
- [ ] `npx tsc --noEmit` is clean

## Schema Stamp
Phase block added / not needed: ...

## Routes Touched
- /write
- /posts/[slug]

## Rollback
How a reviewer can undo the SQL or feature flag this safely.
```

---

## Code Patterns Reviewers Expect

- Server data fetching goes through `createServerSupabase()` in `lib/supabaseServer.ts`.
- Browser mutations go through `createClient()` in `lib/supabaseClient.ts`.
- Protected routes must be added to `middleware.ts`.
- After publish/delete/comment, call `/api/revalidate` for the paths that would otherwise stay stale.
- Optimistic UI must roll back on Supabase errors, same as `LikeButton` and `FollowButton`.

---

## What We Will Reject Quickly

- New UI kits or component libraries
- Replacing Markdown with a WYSIWYG editor in a drive-by PR
- Disabling RLS "just for local testing"
- Seed scripts that insert into `auth.users` with fake passwords
- Drive-by refactors unrelated to the phase

---

## Good First Desks

These are sized for a first contribution:

- Empty-state copy on `/bookmarks` and `/notifications`
- Better excerpt cleanup in `PostCard`
- Show series-ready metadata on post cards once Phase 6 lands
- Improve related-story ranking without new tables
- Docs-only clarifications in `documentation.md`

Pick one, follow the Unique Contributor Path, and open the PR against `dev`.

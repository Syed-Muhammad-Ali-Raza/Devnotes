---
name: supabase
description: Use when writing Supabase SQL, RLS policies, RPC functions, triggers, or any supabase-js query in this project. Covers the two client factories, append-only schema blocks, RLS safety rules, and realtime publication.
---

# Supabase for Devnotes

Devnotes uses Supabase for Auth (GitHub OAuth), Postgres, Storage, and Realtime. All schema lives in the append-only `supabase-schema.sql`.

## The two clients

There are exactly two ways to talk to Supabase. Match the one to where the code runs.

| Where the code runs | Client | Import |
|---|---|---|
| Server Components, route handlers, anything without a browser | `createServerSupabase()` | `@/lib/supabaseServer` |
| `'use client'` components (browser mutations) | `createClient()` | `@/lib/supabaseClient` |

Never call the server client from a client component, or vice versa.

## Schema is append-only

Every change goes in a new **PHASE N** block at the *bottom* of `supabase-schema.sql`:

```text
-- =============================================================================
-- PHASE N — short title
-- Safe to run on existing databases
-- =============================================================================
```

Never rewrite Phase 1–4 history. Existing deployments run only the newest phase block.

## RLS safety checklist

For every table you touch, reason about two logged-in users (Tab A and Tab B):

1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` is present for all user-data tables.
2. **SELECT** policies split public from private:
   - Published posts → public.
   - Drafts → `auth.uid() = author_id` only.
   - Bookmarks → owner only.
3. **Mutating** policies are scoped to `auth.uid()` ownership.
4. Anonymous-safe operations go through an RPC, not a broad grant. See `increment_post_views(uuid)` for the pattern (the RPC holds SECURITY DEFINER and checks the post is published, so the public never gets `UPDATE` on `posts`).

## Realtime

Tables meant for live updates (`comments`, `notifications`) are added to the `supabase_realtime` publication in the SQL, and the operator must confirm them in **Database -> Replication**. Never assume it is on.

## After mutations

When a mutation changes visible data, call `/api/revalidate` with the stale paths (feed `/`, dashboard `/dashboard`, post `/posts/[slug]`, profile `/@username`). Client components may also `router.refresh()`.

## Tables

Core: `profiles`, `posts`, `tags`, `post_tags`, `comments`, `reactions`. Phase 4 adds: `follows`, `bookmarks`, `notifications`, and `posts.view_count`. RPCs: `search_posts(query)` and `increment_post_views(post_id)`.

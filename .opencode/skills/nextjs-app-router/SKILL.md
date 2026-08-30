---
name: nextjs-app-router
description: Use when building or editing Next.js 14 App Router routes, Server vs Client components, routing, metadata/SEO, route handlers, or ISR revalidation in Devnotes.
---

# Next.js App Router patterns for Devnotes

Devnotes runs Next.js 14.2.5 with the App Router, React 18, and ISR. TypeScript is strict.

## Route map (current)

| Route | File | Kind |
|---|---|---|
| `/` | `app/page.tsx` | Home feed, `?tab=latest\|following`, ISR `revalidate=60` |
| `/@[username]` | `app/[username]/page.tsx` | Public profile + `generateMetadata` |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | Article page, ISR `revalidate=60`, full SEO |
| `/tags/[slug]` | `app/tags/[slug]/page.tsx` | Tag archive, ISR |
| `/search` | `app/search/page.tsx` | Full-text search via `search_posts` RPC |
| `/dashboard` | `app/dashboard/page.tsx` | Author console, `force-dynamic` |
| `/write`, `/settings` | `app/write|settings/page.tsx` | Client editors |
| `/bookmarks`, `/notifications` | `app/.../page.tsx` | Private, `force-dynamic`, auth-guarded |
| `/login`, `/auth/callback` | `app/...` | Auth entry + OAuth exchange |
| `/api/revalidate` | `app/api/revalidate/route.ts` | POST ISR revalidation |
| `/feed.xml`, `/sitemap` | `app/feed.xml|sitemap.ts` | RSS + sitemap metadata routes |

## Server vs Client component rule

**Prefer Server Components.** Add `'use client'` only when you need browser state: `useState`/`useEffect`, event handlers, realtime subscriptions, or router mutations. Server components fetch data with `createServerSupabase()`.

## Route guard

Protected routes go in `middleware.ts` at the repo root (not `app/`). Current guard: `/write`, `/dashboard`, `/settings`, `/bookmarks`, `/notifications` redirect unauthenticated users to `/login`.

## ISR revalidation

Public pages use ISR with `revalidate=60`. After a publish/delete/comment/like, POST to `/api/revalidate` with the paths that went stale:

```json
{ "paths": ["/", "/dashboard", "/posts/my-slug", "/@username"] }
```

## SEO / metadata

- Public pages export `generateMetadata` (or a static `metadata`).
- `app/sitemap.ts` builds `/sitemap.xml` from posts, profiles, tags.
- `app/feed.xml/route.ts` emits RSS 2.0.

## Conventions

- `'use client'` pages that read `useSearchParams` must be wrapped in `<Suspense>` (see `app/write/page.tsx`) or the build fails.
- Route handlers return `NextResponse`, not `Response`, for cookie handling.
- Keep dynamic/privacy-sensitive pages `force-dynamic`; keep marketing-like pages ISR'd.

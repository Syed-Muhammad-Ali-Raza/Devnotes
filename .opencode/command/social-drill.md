---
description: Walk through the Two-Tab Social Drill from CONTRIBUTING.md and report what to verify with a second identity.
agent: backend-engineer
---

Run the Two-Tab Social Drill per CONTRIBUTING.md Step 5. Guide the operator through it and report expected pass criteria.

## Tab A (`contrib_aya`)

1. Publish or open a story.
2. Keep `/posts/[slug]` open.
3. Follow Tab B from the profile.

## Tab B (`contrib_neo`)

1. Like the story.
2. Leave a nested reply.
3. Follow Tab A back.
4. Save Tab A's story to the reading list, then open `/bookmarks`.

## Pass criteria to confirm

- Tab A sees a like, comment, and follow notification without a full-page refresh (Realtime push).
- Tab B cannot open Tab A's drafts from `/dashboard` or guess a draft slug.
- Bookmarks never appear on public profiles (RLS-safe privacy).

Report each pass criterion as PASS or FAIL after the operator runs it, with a one-line note.

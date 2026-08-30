---
description: Open sql editor ready to run/verify a schema phase block and remind about realtime publication + schema stamp.
agent: backend-engineer
---

You are running the schema desk-check for Devnotes.

1. Read `supabase-schema.sql`.
2. Identify the newest `PHASE N` block and summarize the tables, indexes, triggers, and RLS policies it adds.
3. Confirm every new table has `ENABLE ROW LEVEL SECURITY` and policies that pass the two-user RLS model.
4. Confirm any realtime table (`comments`, `notifications`, or new ones) is in the `supabase_realtime` publication, else tell the operator.
5. Return a short SQL snippet the operator can run in the Supabase SQL Editor to apply *just* the newest phase block, and remind them to save a snippet named `devnotes-phase-<n>` and record `Schema stamped: Phase <n>` in the PR.

Do not edit files. Report read-only.

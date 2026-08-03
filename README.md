# Setup

```bash
npx create-next-app@latest blog-app --typescript --tailwind --app
cd blog-app
npm install @supabase/ssr @supabase/supabase-js react-markdown
```

Copy these files into matching paths in your project.

1. Create a Supabase project at supabase.com
2. Run `supabase-schema.sql` in the Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL + anon key (Project Settings -> API)
4. Enable an auth provider (Settings -> Auth -> Providers), e.g. GitHub
5. `npm run dev`

Missing piece: a login page (`app/login/page.tsx`) using `supabase.auth.signInWithOAuth`. Ask if you want it next.

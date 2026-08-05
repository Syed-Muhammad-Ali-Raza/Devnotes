# Devnotes 🚀

Devnotes is a modern, content-focused blog site built using the **Next.js App Router** framework and **Supabase** (Auth, Database, Storage, and Realtime). It is designed to offer developers a clean space to read, write, tag, and discuss technical thoughts and stories.

- Product roadmap: [PLANNING.md](./PLANNING.md)
- How to contribute: [CONTRIBUTING.md](./CONTRIBUTING.md)
- System spec: [documentation.md](./documentation.md)

---

## Key Features

- 👤 **GitHub OAuth Authentication**: Quick login integration via Supabase Auth.
- 📝 **Markdown Editor**: Simple, direct writing environment supporting headers, links, and code syntax highlighting.
- 🎛️ **Author Dashboard**: Private draft and published post manager with view stats and delete.
- 🏷️ **Tagging System**: Add topics to stories and browse post feeds filtered by specific tags.
- ❤️ **Interactive Likes**: Optimistic liking mechanism for instant visual feedback.
- 💬 **Live Nested Discussions**: Threaded conversations that update in realtime.
- 👥 **Follow Authors**: Build a personal Following feed from writers you care about.
- 🔖 **Reading List**: Bookmark stories and revisit them later.
- 🔔 **Notifications**: In-app alerts for likes, comments, replies, and new followers.
- 📈 **View Counts**: Track story reach on cards, articles, and the dashboard.
- ⚙️ **Profile Settings**: Custom username handles and bio configuration.
- 🔍 **Search, SEO & RSS**: Full-text search, sitemaps, Open Graph metadata, and an RSS feed.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, ISR, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL Database, Row-Level Security, Realtime, `@supabase/ssr` cookies manager)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Processing**: [React Markdown](https://github.com/remarkjs/react-markdown)

---

## Project Structure

```text
blog-app/
├── app/
│   ├── [username]/           # Public user profile pages (e.g. /@john_doe)
│   ├── auth/callback/        # GitHub OAuth code exchange handler
│   ├── bookmarks/            # Private reading list
│   ├── dashboard/            # Writer console (drafts, views, delete)
│   ├── login/                # Authentication portal
│   ├── notifications/        # In-app notification inbox
│   ├── posts/[slug]/         # Article page (likes, bookmarks, comments, related)
│   ├── search/               # Full-text search results
│   ├── settings/             # User settings editor (bio, username, avatar)
│   ├── tags/[slug]/          # Tag-specific articles list
│   ├── write/                # Editor workspace
│   ├── layout.tsx            # Root framework layout with dynamic Navbar
│   └── page.tsx              # Home feed (Latest / Following)
├── components/
│   ├── Navbar.tsx            # Session-aware site header
│   ├── PostCard.tsx          # Card preview with reading estimation and tags
│   ├── CommentSection.tsx    # Live threaded discussion handler
│   ├── LikeButton.tsx        # Optimistic like toggle
│   ├── BookmarkButton.tsx    # Reading list toggle
│   ├── FollowButton.tsx      # Author follow/unfollow control
│   ├── NotificationBell.tsx  # Realtime notification dropdown
│   └── TagInput.tsx          # Tag creation controller inside the write page
├── lib/
│   ├── supabaseClient.ts     # Client-side Supabase client
│   └── supabaseServer.ts     # Server-side Supabase client
├── supabase-schema.sql       # Database DDL statements & security policies
└── tailwind.config.ts        # Custom theme values (Slate/Zinc colors)
```

---

## Local Setup Instructions

### 1. Repository Setup
Clone the repository and install required packages:
```bash
git clone <repository-url>
cd blog-app
npm install
```

### 2. Database Provisioning
1. Sign in to your [Supabase Dashboard](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** tab in Supabase.
3. Paste the contents of [supabase-schema.sql](./supabase-schema.sql) and click **Run**. This constructs your tables (`profiles`, `posts`, `tags`, `post_tags`, `comments`, `reactions`, `follows`, `bookmarks`, `notifications`), indexes, triggers, RPC helpers, and Row Level Security (RLS) policies.
4. If the project already exists from an earlier phase, run only the **PHASE 4** section at the bottom of `supabase-schema.sql`.
5. In **Database -> Replication**, confirm `comments` and `notifications` are enabled for Realtime (the schema attempts to add them automatically).

### 3. OAuth Provider Integration
1. Go to your **GitHub Settings** -> **Developer Settings** -> **OAuth Apps** and click **New OAuth App**.
2. Set your Homepage URL to `http://localhost:3000`.
3. Set your Authorization callback URL to:
   `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`
4. Register the app, then copy your **Client ID** and **Client Secret**.
5. Back in **Supabase**, go to **Auth Settings** -> **Providers** -> **GitHub**. Toggle to enable GitHub, paste your credentials, and click **Save**.

### 4. Configuration Environment
Create a copy of the example environment file:
```bash
cp .env.local.example .env.local
```
Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Running the Application
Spin up the local developer environment:
```bash
npm run dev
```
Open `http://localhost:3000` to preview the site.

### 6. Unique Local Desk Check
Before contributing code, complete the short writing-desk ritual:

1. Sign in and claim a `/settings` handle that starts with `contrib_`.
2. Publish one story titled `Desk Check: <your handle>` with tags `devnotes` and `contrib`.
3. Confirm it shows on the home feed, `/tags/devnotes`, `/sitemap.xml`, and `/feed.xml`.
4. Use a second GitHub session to like, reply, and follow — then confirm notifications appear live.
5. Press **Listen to this article** on your story and stop playback.

Full contributor steps live in [CONTRIBUTING.md](./CONTRIBUTING.md). Upcoming phases live in [PLANNING.md](./PLANNING.md).

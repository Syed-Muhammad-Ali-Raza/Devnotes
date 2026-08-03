# Devnotes 🚀

Devnotes is a modern, content-focused blog site built using the **Next.js App Router** framework and **Supabase** (Auth, Database, Storage, and Realtime). It is designed to offer developers a clean space to read, write, tag, and discuss technical thoughts and stories.

---

## Key Features

- 👤 **GitHub OAuth Authentication**: Quick login integration via Supabase Auth.
- 📝 **Markdown Editor**: Simple, direct writing environment supporting headers, links, and code syntax highlighting.
- 🎛️ **Author Dashboard**: Private draft and published post manager.
- 🏷️ **Tagging System**: Add topics to stories and browse post feeds filtered by specific tags.
- ❤️ **Interactive Likes**: Optimistic liking mechanism for instant visual feedback.
- 💬 **Nested Discussions**: Threaded conversations for interactive reader replies.
- ⚙️ **Profile Settings**: Custom username handles and bio configuration.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, ISR, Server Components)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL Database, Row-Level Security, `@supabase/ssr` cookies manager)
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
│   ├── dashboard/            # Writer console (Drafts and Published posts list)
│   ├── login/                # Authentication portal
│   ├── posts/[slug]/         # Interactive single article page (Likes, Comments, Tags)
│   ├── settings/             # User settings editor (Bio, username, avatar)
│   ├── tags/[slug]/          # Tag-specific articles list
│   ├── layout.tsx            # Root framework layout with dynamic Navbar
│   └── page.tsx              # Home Feed showing latest published posts
├── components/
│   ├── Navbar.tsx            # Session-aware site header
│   ├── PostCard.tsx          # Card preview with reading estimation and tags list
│   ├── CommentSection.tsx    # Nested comments UI handler
│   ├── LikeButton.tsx        # Optimistically updated Like Button component
│   └── TagInput.tsx          # Tag creation controller inside the write page
├── lib/
│   ├── supabaseClient.ts     # Client-side Supabase client (using browser cookies context)
│   └── supabaseServer.ts     # Server-side Supabase client (using server cookies context)
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
3. Paste the contents of [supabase-schema.sql](file:///c:/Users/Senarios/Downloads/blog-app/supabase-schema.sql) and click **Run**. This constructs your tables (`profiles`, `posts`, `tags`, `post_tags`, `comments`, `reactions`), indexes, triggers, and Row Level Security (RLS) policies.

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

import { createServerSupabase } from '@/lib/supabaseServer'
import PostCard from '@/components/PostCard'
import { redirect } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import type { PostCardData } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function BookmarksPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookmarkRows } = await supabase
    .from('bookmarks')
    .select(
      'created_at, posts(slug, title, content_md, published_at, view_count, profiles(username, avatar_url), post_tags(tags(name, slug)))'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const posts: PostCardData[] = (bookmarkRows || [])
    .map((row) => {
      const post = Array.isArray(row.posts) ? row.posts[0] : row.posts
      return (post as unknown as PostCardData | null) ?? null
    })
    .filter((post): post is PostCardData => Boolean(post))

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 flex items-center gap-3 border-b border-zinc-100 pb-6">
        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-3 text-zinc-700">
          <Bookmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Reading list</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {posts.length} saved {posts.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-150 bg-zinc-50/50 py-16 text-center">
          <p className="text-sm italic text-zinc-400">
            Save stories you want to revisit. They will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}

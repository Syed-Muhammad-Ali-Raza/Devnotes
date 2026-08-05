import { createServerSupabase } from '@/lib/supabaseServer'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import type { PostCardData } from '@/lib/types'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const supabase = await createServerSupabase()
  const tab = searchParams.tab === 'following' ? 'following' : 'latest'
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const selectFields =
    'slug, title, content_md, published_at, view_count, profiles(username, avatar_url), post_tags(tags(name, slug))'

  let posts: PostCardData[] = []

  if (tab === 'following') {
    if (!user) {
      posts = []
    } else {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const authorIds = (follows || []).map((row) => row.following_id)
      if (authorIds.length > 0) {
        const { data } = await supabase
          .from('posts')
          .select(selectFields)
          .in('author_id', authorIds)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
        posts = (data || []) as unknown as PostCardData[]
      }
    }
  } else {
    const { data } = await supabase
      .from('posts')
      .select(selectFields)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    posts = (data || []) as unknown as PostCardData[]
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Devnotes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            A curated collection of developer experiences and stories.
          </p>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-zinc-100 pb-1">
        <Link
          href="/"
          className={`rounded-t-lg px-3 py-2 text-sm font-semibold transition ${
            tab === 'latest'
              ? 'border-b-2 border-zinc-950 text-zinc-950'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Latest
        </Link>
        <Link
          href={user ? '/?tab=following' : '/login'}
          className={`rounded-t-lg px-3 py-2 text-sm font-semibold transition ${
            tab === 'following'
              ? 'border-b-2 border-zinc-950 text-zinc-950'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Following
        </Link>
      </div>

      {tab === 'following' && !user ? (
        <div className="rounded-2xl border border-zinc-150 bg-white py-16 text-center">
          <p className="text-sm italic text-zinc-400">Sign in to follow authors and build a personal feed.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-150 bg-white py-16 text-center">
          <p className="text-sm italic text-zinc-400">
            {tab === 'following'
              ? 'You are not following anyone with published stories yet.'
              : 'No stories published yet. Be the first to publish.'}
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

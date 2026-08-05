import { createServerSupabase } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import type { Metadata } from 'next'
import type { PostCardData } from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username: rawUsername } = await params
  const decoded = decodeURIComponent(rawUsername)
  if (!decoded.startsWith('@')) return { title: 'Profile Not Found | Devnotes' }
  const username = decoded.slice(1)

  const supabase = await createServerSupabase()
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, bio')
    .eq('username', username)
    .maybeSingle()

  if (!profile) return { title: 'Profile Not Found | Devnotes' }

  return {
    title: `@${profile.username} | Devnotes`,
    description: profile.bio || `Developer profile of @${profile.username} on Devnotes.`,
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username: rawUsername } = await params
  const decoded = decodeURIComponent(rawUsername)

  if (!decoded.startsWith('@')) {
    return notFound()
  }

  const username = decoded.slice(1)
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return notFound()
  }

  const [{ data: posts }, followerResult, followingResult, authResult] = await Promise.all([
    supabase
      .from('posts')
      .select(
        'slug, title, content_md, published_at, view_count, profiles(username, avatar_url), post_tags(tags(name, slug))'
      )
      .eq('author_id', profile.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase.auth.getUser(),
  ])

  const currentUser = authResult.data.user
  let isFollowing = false
  if (currentUser && currentUser.id !== profile.id) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!followRow
  }

  const typedPosts = (posts || []) as unknown as PostCardData[]

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-6 border-b border-zinc-100 pb-8">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="h-20 w-20 rounded-full border border-zinc-200/60 bg-zinc-100 object-cover shadow-sm"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-300/40 bg-zinc-200 text-2xl font-bold text-zinc-600 shadow-inner">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">@{profile.username}</h1>
          <p className="mt-1 max-w-md text-sm text-zinc-500">{profile.bio || 'No bio written yet.'}</p>
          <p className="mt-2 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-700">{followerResult.count ?? 0}</span> followers ·{' '}
            <span className="font-semibold text-zinc-700">{followingResult.count ?? 0}</span> following
          </p>
          {currentUser && currentUser.id !== profile.id && (
            <div className="mt-4">
              <FollowButton profileId={profile.id} initialIsFollowing={isFollowing} />
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-6 text-lg font-semibold text-zinc-800">Published Stories</h2>

      {typedPosts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-100 bg-zinc-50/50 py-8 text-center text-sm italic text-zinc-400">
          No stories published yet.
        </p>
      ) : (
        <div className="space-y-6">
          {typedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}

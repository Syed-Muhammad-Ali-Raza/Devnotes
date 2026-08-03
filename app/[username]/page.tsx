import { createServerSupabase } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username: rawUsername } = await params
  const decoded = decodeURIComponent(rawUsername)

  // Profile pages must start with '@'
  if (!decoded.startsWith('@')) {
    return notFound()
  }

  const username = decoded.slice(1) // Strip the '@'
  const supabase = await createServerSupabase()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, bio')
    .eq('username', username)
    .single()

  if (!profile) {
    return notFound()
  }

  // Fetch posts by this author
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, content_md, published_at, profiles(username, avatar_url), post_tags(tags(name, slug))')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-6 border-b border-zinc-100 pb-8 mb-8">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-20 h-20 rounded-full object-cover bg-zinc-100 border border-zinc-200/60 shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-200 border border-zinc-300/40 flex items-center justify-center font-bold text-zinc-600 text-2xl shadow-inner">
            {profile.username[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">@{profile.username}</h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-md">{profile.bio || 'No bio written yet.'}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-zinc-800 mb-6">Published Stories</h2>
      
      {!posts || posts.length === 0 ? (
        <p className="text-zinc-400 text-sm italic py-8 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-100">
          No stories published yet.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}

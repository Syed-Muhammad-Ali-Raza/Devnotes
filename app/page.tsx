import { createServerSupabase } from '@/lib/supabaseServer'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

// Regenerate this page every 60 seconds (ISR) instead of on every request
export const revalidate = 60

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, content_md, published_at, profiles(username, avatar_url), post_tags(tags(name, slug))')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Devnotes</h1>
          <p className="text-zinc-500 text-sm mt-1">A curated collection of developer experiences and stories.</p>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-150 rounded-2xl">
          <p className="text-zinc-400 italic text-sm">No stories published yet. Be the first to publish.</p>
        </div>
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

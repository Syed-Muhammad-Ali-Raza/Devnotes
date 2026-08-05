import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabaseServer'

interface RelatedPostsProps {
  postId: string
  tagIds: string[]
}

export default async function RelatedPosts({ postId, tagIds }: RelatedPostsProps) {
  if (tagIds.length === 0) return null

  const supabase = await createServerSupabase()

  const { data: linked } = await supabase
    .from('post_tags')
    .select('post_id')
    .in('tag_id', tagIds)
    .neq('post_id', postId)

  const relatedIds = Array.from(new Set((linked || []).map((row) => row.post_id))).slice(0, 12)
  if (relatedIds.length === 0) return null

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, title, published_at, view_count')
    .in('id', relatedIds)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) return null

  return (
    <section className="mt-14 border-t border-zinc-100 pt-10">
      <h2 className="mb-5 text-lg font-bold text-zinc-900">Related stories</h2>
      <div className="grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="rounded-xl border border-zinc-150 bg-white px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <p className="font-semibold text-zinc-900">{post.title}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {typeof post.view_count === 'number' ? ` · ${post.view_count} views` : ''}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

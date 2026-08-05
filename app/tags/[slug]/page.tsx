import { createServerSupabase } from '@/lib/supabaseServer'
import PostCard from '@/components/PostCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .maybeSingle()

  if (!tag) return { title: 'Tag Not Found | Devnotes' }

  return {
    title: `Stories on #${tag.name} | Devnotes`,
    description: `Read technical blog articles and developer guides discussing #${tag.name} on Devnotes.`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  // 1. Fetch tag metadata
  const { data: tag } = await supabase
    .from('tags')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return notFound()
  }

  // 2. Fetch linked post ids
  const { data: postTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id)

  const postIds = postTags ? postTags.map((pt: any) => pt.post_id) : []

  // 3. Fetch public posts matching these IDs
  let posts: {
    slug: string
    title: string
    content_md: string
    published_at: string
    view_count?: number | null
    profiles: { username: string; avatar_url: string | null } | null
    post_tags?: { tags: { name: string; slug: string } | null }[] | null
  }[] = []
  if (postIds.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('slug, title, content_md, published_at, view_count, profiles(username, avatar_url), post_tags(tags(name, slug))')
      .in('id', postIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    
    posts = (data || []) as unknown as typeof posts
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3 border-b border-zinc-100 pb-6 mb-10">
        <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-2xl text-zinc-700">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            #{tag.name}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {posts.length} {posts.length === 1 ? 'story' : 'stories'} published in this topic.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50/50 border border-zinc-150 rounded-2xl border-dashed">
          <p className="text-zinc-400 italic text-sm">No stories published under this tag yet.</p>
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

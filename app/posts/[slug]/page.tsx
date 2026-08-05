import { createServerSupabase } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import TextToSpeech from '@/components/TextToSpeech'
import BookmarkButton from '@/components/BookmarkButton'
import ViewTracker from '@/components/ViewTracker'
import RelatedPosts from '@/components/RelatedPosts'
import { Eye } from 'lucide-react'
import { estimateReadingTime } from '@/lib/format'
import type { Metadata } from 'next'

export const revalidate = 60

type PostTagJoin = { tags: { id: string; name: string; slug: string } | null }
type AuthorProfile = { username: string; avatar_url: string | null }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: post } = await supabase
    .from('posts')
    .select('title, content_md, cover_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!post) return { title: 'Post Not Found | Devnotes' }

  const cleanDescription = post.content_md.replace(/[#*`_[\]]/g, '').slice(0, 160) + '...'

  return {
    title: `${post.title} | Devnotes`,
    description: cleanDescription,
    openGraph: {
      title: post.title,
      description: cleanDescription,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanDescription,
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const { data: post } = await supabase
    .from('posts')
    .select(
      'id, slug, title, content_md, published_at, cover_image, view_count, profiles(username, avatar_url), post_tags(tags(id, name, slug))'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return notFound()

  const { count: likesCount } = await supabase
    .from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post.id)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userHasLiked = false
  let userHasBookmarked = false
  if (user) {
    const [{ data: userLike }, { data: bookmark }] = await Promise.all([
      supabase.from('reactions').select('user_id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('bookmarks').select('post_id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
    ])
    userHasLiked = !!userLike
    userHasBookmarked = !!bookmark
  }

  const date = new Date(post.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const readingTime = estimateReadingTime(post.content_md)
  const profile = (Array.isArray(post.profiles) ? post.profiles[0] : post.profiles) as unknown as AuthorProfile | null
  const postTags = (post.post_tags || []) as unknown as PostTagJoin[]
  const tagIds = postTags.map((pt) => pt.tags?.id).filter((id): id is string => Boolean(id))

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <ViewTracker postId={post.id} />
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="mb-8 max-h-96 w-full rounded-2xl border border-zinc-200/50 object-cover shadow-sm"
        />
      )}

      <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
        {post.title}
      </h1>

      <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
        <Link
          href={`/@${profile?.username ?? ''}`}
          className="flex items-center gap-2 transition-colors hover:text-zinc-900"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-8 w-8 rounded-full border border-zinc-200/60 bg-zinc-200 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600">
              {profile?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <span className="font-semibold text-zinc-800">@{profile?.username ?? 'unknown'}</span>
        </Link>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span className="rounded-full border border-zinc-100 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
          {readingTime} min read
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
          <Eye className="h-3.5 w-3.5" />
          {post.view_count ?? 0}
        </span>
      </div>

      {postTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1.5 border-b border-zinc-100 pb-6">
          {postTags.map(
            (pt) =>
              pt.tags && (
                <Link
                  key={pt.tags.slug}
                  href={`/tags/${pt.tags.slug}`}
                  className="rounded-full border border-zinc-150 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  #{pt.tags.name}
                </Link>
              )
          )}
        </div>
      )}

      <TextToSpeech contentMarkdown={post.content_md} title={post.title} />

      <article className="prose prose-zinc max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:underline">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <div className="relative my-6 overflow-hidden rounded-xl border border-zinc-250 bg-zinc-950 font-mono shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-850 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-400">
                    <span>{match[1]}</span>
                  </div>
                  <pre className="overflow-x-auto bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code
                  className="rounded border border-zinc-200/50 bg-zinc-100/80 px-1.5 py-0.5 font-mono text-xs text-zinc-800"
                  {...props}
                >
                  {children}
                </code>
              )
            },
          }}
        >
          {post.content_md}
        </ReactMarkdown>
      </article>

      <div className="mt-12 flex items-center justify-between border-t border-zinc-100 pt-6">
        <div className="flex items-center gap-2">
          <LikeButton
            postId={post.id}
            initialLikesCount={likesCount ?? 0}
            initialUserHasLiked={userHasLiked}
          />
          <BookmarkButton postId={post.id} initialBookmarked={userHasBookmarked} />
        </div>
      </div>

      <RelatedPosts postId={post.id} tagIds={tagIds} />

      <CommentSection postId={post.id} postSlug={post.slug} />
    </main>
  )
}

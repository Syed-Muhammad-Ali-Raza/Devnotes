import Link from 'next/link'
import { Eye } from 'lucide-react'
import { estimateReadingTime } from '@/lib/format'
import type { PostCardData } from '@/lib/types'

export default function PostCard({ post }: { post: PostCardData }) {
  const excerpt = post.content_md.replace(/[#*`_>-]/g, '').slice(0, 140)
  const date = new Date(post.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const readingTime = estimateReadingTime(post.content_md)

  return (
    <article className="group relative rounded-2xl border border-zinc-150 bg-white p-6 transition-all duration-200 ease-in-out hover:shadow-md">
      <div className="mb-3 flex items-center gap-3 text-sm text-zinc-500">
        <Link
          href={`/@${post.profiles?.username ?? ''}`}
          className="flex items-center gap-2 transition-colors hover:text-zinc-900"
        >
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.username}
              className="h-6 w-6 rounded-full border border-zinc-200/60 bg-zinc-200 object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600">
              {post.profiles?.username[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <span className="font-semibold text-zinc-700 group-hover:underline">
            @{post.profiles?.username ?? 'unknown'}
          </span>
        </Link>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span className="rounded-full border border-zinc-100/80 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
          {readingTime} min read
        </span>
        {typeof post.view_count === 'number' && (
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
            <Eye className="h-3 w-3" />
            {post.view_count}
          </span>
        )}
      </div>

      <Link href={`/posts/${post.slug}`} className="block">
        <h2 className="mb-2 text-xl font-bold leading-snug text-zinc-900 transition-colors group-hover:text-black">
          {post.title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-zinc-600">{excerpt}...</p>
      </Link>

      {post.post_tags && post.post_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.post_tags.map(
            (pt) =>
              pt.tags && (
                <Link
                  key={pt.tags.slug}
                  href={`/tags/${pt.tags.slug}`}
                  className="rounded-md border border-zinc-150 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
                >
                  #{pt.tags.name}
                </Link>
              )
          )}
        </div>
      )}
    </article>
  )
}

import Link from 'next/link'

type Post = {
  slug: string
  title: string
  content_md: string
  published_at: string
  profiles: { username: string; avatar_url: string | null } | null
  post_tags?: { tags: { name: string; slug: string } | null }[] | null
}

export default function PostCard({ post }: { post: Post }) {
  const excerpt = post.content_md.replace(/[#*`_>-]/g, '').slice(0, 140)
  
  const date = new Date(post.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Calculate word count and estimated reading time
  const words = post.content_md.trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(words / 200))

  return (
    <article className="group relative bg-white border border-zinc-150 rounded-2xl p-6 hover:shadow-md transition-all duration-200 ease-in-out">
      <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
        <Link href={`/@${post.profiles?.username ?? ''}`} className="flex items-center gap-2 hover:text-zinc-900 transition-colors">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.username}
              className="w-6 h-6 rounded-full object-cover bg-zinc-200 border border-zinc-200/60"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center font-semibold text-[10px] text-zinc-600">
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
        <span className="bg-zinc-50 border border-zinc-100/80 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-zinc-500">
          {readingTime} min read
        </span>
      </div>
      
      <Link href={`/posts/${post.slug}`} className="block">
        <h2 className="text-xl font-bold text-zinc-900 group-hover:text-black transition-colors mb-2 leading-snug">
          {post.title}
        </h2>
        <p className="text-zinc-600 text-sm leading-relaxed mb-4">{excerpt}...</p>
      </Link>

      {post.post_tags && post.post_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.post_tags.map((pt: any) => pt.tags && (
            <Link
              key={pt.tags.slug}
              href={`/tags/${pt.tags.slug}`}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-150 rounded-md px-2 py-0.5 transition"
            >
              #{pt.tags.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}

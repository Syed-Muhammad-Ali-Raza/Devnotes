import { createServerSupabase } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

export const revalidate = 60

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const { data: post } = await supabase
    .from('posts')
    .select('title, content_md, published_at, cover_image, profiles(username, avatar_url)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return notFound()

  const date = new Date(post.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Calculate estimated reading time
  const words = post.content_md.trim().split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const profile = post.profiles as any

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full rounded-2xl mb-8 object-cover max-h-96 shadow-sm border border-zinc-200/50"
        />
      )}
      
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4 leading-tight">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 border-b border-zinc-100 pb-6 mb-8 text-zinc-500 text-sm">
        <Link href={`/@${profile?.username ?? ''}`} className="flex items-center gap-2 hover:text-zinc-900 transition-colors">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-8 h-8 rounded-full object-cover bg-zinc-200 border border-zinc-200/60"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-600">
              {profile?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          <span className="font-semibold text-zinc-800">
            @{profile?.username ?? 'unknown'}
          </span>
        </Link>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span className="bg-zinc-50 px-2.5 py-0.5 rounded-full text-xs font-medium text-zinc-500 border border-zinc-100">
          {readingTime} min read
        </span>
      </div>

      <article className="prose prose-zinc max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:underline">
        <ReactMarkdown
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return match ? (
                <div className="relative my-6 rounded-xl overflow-hidden border border-zinc-250 bg-zinc-950 shadow-sm font-mono">
                  <div className="bg-zinc-900/60 border-b border-zinc-850 px-4 py-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>{match[1]}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm text-zinc-100 leading-relaxed bg-zinc-950">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-zinc-100/80 border border-zinc-200/50 text-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {post.content_md}
        </ReactMarkdown>
      </article>
    </main>
  )
}

import { createServerSupabase } from '@/lib/supabaseServer'
import PostCard from '@/components/PostCard'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q || ''
  const query = q.trim()

  const supabase = await createServerSupabase()
  let posts: any[] = []
  let error = ''

  if (query) {
    // Call the postgres search function RPC
    const { data, error: searchError } = await supabase.rpc('search_posts', {
      search_query: query,
    })

    if (searchError) {
      error = 'Search engine encountered an error.'
      console.error(searchError)
    } else {
      // Map return columns from RPC to match PostCard requirements
      posts = (data || []).map((p: any) => ({
        slug: p.slug,
        title: p.title,
        content_md: p.content_md,
        published_at: p.published_at,
        profiles: {
          username: p.author_username,
          avatar_url: p.author_avatar_url,
        },
        post_tags: [], // Tags mapping is optional for search lists
      }))
    }
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
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">
            Search Stories
          </h1>
          {query && (
            <p className="text-zinc-500 text-sm mt-0.5">
              Found {posts.length} {posts.length === 1 ? 'result' : 'results'} matching &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="text-center py-6 text-red-600 text-sm bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {!query ? (
        <div className="text-center py-16 bg-zinc-50/50 border border-zinc-150 rounded-2xl border-dashed">
          <p className="text-zinc-400 italic text-sm">Please type keywords in the search bar above to look for stories.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50/50 border border-zinc-150 rounded-2xl border-dashed">
          <p className="text-zinc-400 italic text-sm">No stories matched your search query. Try another keyword!</p>
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

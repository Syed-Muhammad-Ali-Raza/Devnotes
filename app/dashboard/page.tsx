import { createServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DeletePostButton from '@/components/DeletePostButton'
import { Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, created_at, view_count')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage drafts, published stories, and reach.</p>
        </div>
        <Link
          href="/write"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New Story
        </Link>
      </div>

      <div className="space-y-4">
        {!posts || posts.length === 0 ? (
          <p className="py-10 text-center text-gray-500">You haven&apos;t written any posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition hover:shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{post.title || 'Untitled'}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                    <Eye className="h-3 w-3" />
                    {post.view_count ?? 0} views
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/write?id=${post.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                  Edit
                </Link>
                <DeletePostButton postId={post.id} slug={post.slug} />
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

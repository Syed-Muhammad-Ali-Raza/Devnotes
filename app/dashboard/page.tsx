import { createServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and edit your stories.</p>
        </div>
        <Link href="/write" className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-800">
          New Story
        </Link>
      </div>

      <div className="space-y-4">
        {!posts || posts.length === 0 ? (
          <p className="text-gray-500 py-10 text-center">You haven't written any posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:shadow-sm transition bg-white">
              <div>
                <h3 className="font-semibold text-gray-900">{post.title || 'Untitled'}</h3>
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 ${
                  post.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {post.status}
                </span>
              </div>
              <Link href={`/write?id=${post.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

import { createServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'
import { notificationCopy } from '@/lib/notifications'
import type { NotificationRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)

  const { data } = await supabase
    .from('notifications')
    .select(
      'id, user_id, actor_id, type, post_id, comment_id, read, created_at, actor:profiles!actor_id(username, avatar_url), post:posts(title, slug)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (data || []) as unknown as NotificationRow[]

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 flex items-center gap-3 border-b border-zinc-100 pb-6">
        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-3 text-zinc-700">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Notifications</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Likes, replies, and new followers.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-150 bg-zinc-50/50 py-16 text-center">
          <p className="text-sm italic text-zinc-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const href =
              item.type === 'follow'
                ? `/@${item.actor?.username || ''}`
                : `/posts/${item.post?.slug || ''}`

            return (
              <Link
                key={item.id}
                href={href}
                className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 transition hover:border-zinc-200 hover:shadow-sm"
              >
                {item.actor?.avatar_url ? (
                  <img
                    src={item.actor.avatar_url}
                    alt={item.actor.username}
                    className="h-9 w-9 rounded-full border border-zinc-200 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500">
                    {item.actor?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-800">{notificationCopy(item)}</p>
                  <p className="mt-1 text-xs text-zinc-400">{formatRelativeTime(item.created_at)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}

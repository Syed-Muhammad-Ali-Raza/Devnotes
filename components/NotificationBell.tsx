'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import { Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'
import { notificationCopy } from '@/lib/notifications'
import type { NotificationRow } from '@/lib/types'

export default function NotificationBell() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unread, setUnread] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await loadNotifications(user.id)
    }

    void bootstrap()
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void loadNotifications(userId)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId])

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function loadNotifications(id: string) {
    const { data } = await supabase
      .from('notifications')
      .select(
        'id, user_id, actor_id, type, post_id, comment_id, read, created_at, actor:profiles!actor_id(username, avatar_url), post:posts(title, slug)'
      )
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(8)

    const rows = (data || []) as unknown as NotificationRow[]
    setItems(rows)
    setUnread(rows.filter((row) => !row.read).length)
  }

  async function markAllRead() {
    if (!userId || unread === 0) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    setItems((current) => current.map((row) => ({ ...row, read: true })))
    setUnread(0)
  }

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (next) await markAllRead()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5 h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <p className="text-sm font-bold text-zinc-900">Notifications</p>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
            >
              View all
            </Link>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs italic text-zinc-400">
              You are all caught up.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-zinc-50 last:border-b-0">
                  <Link
                    href={
                      item.type === 'follow'
                        ? `/@${item.actor?.username || ''}`
                        : `/posts/${item.post?.slug || ''}`
                    }
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <p>{notificationCopy(item)}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

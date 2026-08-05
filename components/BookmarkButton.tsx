'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Bookmark } from 'lucide-react'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
}

export default function BookmarkButton({
  postId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [busy, setBusy] = useState(false)

  async function handleToggle() {
    if (busy) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const previous = bookmarked
    setBookmarked(!bookmarked)
    setBusy(true)

    if (previous) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)

      if (error) setBookmarked(previous)
    } else {
      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        post_id: postId,
      })

      if (error) setBookmarked(previous)
    }

    setBusy(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
        bookmarked
          ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/70'
          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
      }`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save to reading list'}
    >
      <Bookmark
        className={`h-4 w-4 ${bookmarked ? 'fill-amber-600 stroke-amber-600' : ''}`}
      />
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}

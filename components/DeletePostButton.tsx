'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Trash2, Loader2 } from 'lucide-react'

interface DeletePostButtonProps {
  postId: string
  slug: string
}

export default function DeletePostButton({ postId, slug }: DeletePostButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (busy) return
    const confirmed = window.confirm('Delete this story permanently? This cannot be undone.')
    if (!confirmed) return

    setBusy(true)
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (!error) {
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: ['/', '/dashboard', `/posts/${slug}`] }),
        })
      } catch {
        // Cache refresh is best-effort
      }
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 transition hover:text-red-600 disabled:opacity-50"
      aria-label="Delete story"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Delete
    </button>
  )
}

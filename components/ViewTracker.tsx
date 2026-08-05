'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `devnotes-viewed-${postId}`
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(key)) return

    sessionStorage.setItem(key, '1')
    const supabase = createClient()
    void supabase.rpc('increment_post_views', { target_post_id: postId })
  }, [postId])

  return null
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  profileId: string
  initialIsFollowing: boolean
}

export default function FollowButton({
  profileId,
  initialIsFollowing,
}: FollowButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [following, setFollowing] = useState(initialIsFollowing)
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

    if (user.id === profileId) return

    const previousFollowing = following

    setFollowing(!following)
    setBusy(true)

    if (previousFollowing) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId)

      if (error) {
        setFollowing(previousFollowing)
      }
    } else {
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: profileId,
      })

      if (error) {
        setFollowing(previousFollowing)
      }
    }

    setBusy(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        following
          ? 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
          : 'bg-zinc-950 text-white hover:bg-zinc-800'
      }`}
      aria-label={following ? 'Unfollow author' : 'Follow author'}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {following ? 'Following' : 'Follow'}
    </button>
  )
}

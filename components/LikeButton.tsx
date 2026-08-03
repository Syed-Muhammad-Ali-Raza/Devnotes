'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialLikesCount: number
  initialUserHasLiked: boolean
}

export default function LikeButton({
  postId,
  initialLikesCount,
  initialUserHasLiked,
}: LikeButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [liked, setLiked] = useState(initialUserHasLiked)
  const [count, setCount] = useState(initialLikesCount)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  async function handleLikeToggle() {
    if (loading) return

    if (!user) {
      // Redirect to login if user tries to like without authentication
      router.push('/login')
      return
    }

    const previousLiked = liked
    const previousCount = count

    // Optimistic UI updates
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)

    if (previousLiked) {
      // Unlike
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to remove reaction:', error.message)
        // Rollback state
        setLiked(previousLiked)
        setCount(previousCount)
      }
    } else {
      // Like
      const { error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          type: 'like',
        })

      if (error) {
        console.error('Failed to register reaction:', error.message)
        // Rollback state
        setLiked(previousLiked)
        setCount(previousCount)
      }
    }
  }

  return (
    <button
      onClick={handleLikeToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        liked
          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100/70 shadow-sm'
          : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
      }`}
      aria-label={liked ? 'Unlike post' : 'Like post'}
    >
      <Heart
        className={`w-4 h-4 transition-transform duration-200 ${
          liked ? 'fill-rose-600 stroke-rose-600 scale-110' : 'stroke-zinc-500 group-hover:scale-105'
        }`}
      />
      <span>{count}</span>
    </button>
  )
}

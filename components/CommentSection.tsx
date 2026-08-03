'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Loader2, MessageSquare, CornerDownRight, Trash2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  username: string
  avatar_url: string | null
}

interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  profiles: Profile | null
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const supabase = createClient()

  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Input fields
  const [content, setContent] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch comments list
      await fetchComments()
      setLoading(false)
    }
    loadData()
  }, [postId])

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to load comments:', error.message)
    } else if (data) {
      setComments(data as Comment[])
    }
  }

  async function handleSubmit(parentId: string | null = null) {
    setError('')
    const text = parentId ? replyContent.trim() : content.trim()
    if (!text) return

    if (!user) {
      setError('You must be logged in to comment.')
      return
    }

    setSubmitting(true)
    
    // In database schema: check (auth.uid() = author_id)
    // Wait! Let's look closely at the policy:
    // create policy "Logged-in users can comment" on public.comments for insert with check (auth.uid() = author_id);
    // So we must supply author_id as user.id in the payload!
    const { data: insertedData, error: insertError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        parent_id: parentId,
        content: text,
      })
      .select('*, profiles(username, avatar_url)')
      .single()

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
    } else {
      if (parentId) {
        setReplyContent('')
        setReplyToId(null)
      } else {
        setContent('')
      }
      // Re-fetch comments to ensure the profile triggers are resolved correctly
      await fetchComments()
    }
  }

  async function handleDelete(commentId: string) {
    const previousComments = [...comments]
    
    // Optimistic deletion
    setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId))

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Failed to delete comment:', error.message)
      setComments(previousComments) // rollback
    }
  }

  // Parse hierarchy
  const rootComments = comments.filter(c => !c.parent_id)
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-950 mb-2" />
        <span className="text-xs">Loading dialogue...</span>
      </div>
    )
  }

  return (
    <section className="mt-12 border-t border-zinc-100 pt-10">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 font-bold text-lg">
        <MessageSquare className="w-5 h-5 text-zinc-500" />
        <h2>Discussion ({comments.length})</h2>
      </div>

      {/* Main Comment Input */}
      {user ? (
        <div className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are your thoughts on this story? (Markdown not supported)"
            rows={3}
            className="w-full rounded-xl border border-zinc-200 p-3.5 text-sm text-zinc-950 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition bg-zinc-50/30"
          />
          <div className="flex justify-between items-center mt-2.5">
            <span className="text-xs text-zinc-400">Be respectful and constructive.</span>
            <button
              onClick={() => handleSubmit(null)}
              disabled={submitting || !content.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 transition"
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
          {error && !replyToId && (
            <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 text-xs mt-3">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-6 text-center mb-8">
          <p className="text-zinc-500 text-sm">
            Interested in joining the discussion?{' '}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              Sign in with GitHub
            </Link>{' '}
            to share your thoughts.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {rootComments.length === 0 ? (
          <p className="text-zinc-400 italic text-sm text-center py-6">No discussions yet. Start the conversation!</p>
        ) : (
          rootComments.map(comment => {
            const commentReplies = getReplies(comment.id)
            const isAuthor = user && user.id === comment.author_id

            return (
              <div key={comment.id} className="border-b border-zinc-50 pb-6 last:border-b-0">
                {/* Comment body */}
                <div className="flex gap-3">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-200/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {comment.profiles?.username?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/@${comment.profiles?.username}`}
                          className="font-semibold text-sm text-zinc-800 hover:underline"
                        >
                          @{comment.profiles?.username ?? 'unknown'}
                        </Link>
                        <span className="text-zinc-300 text-[10px]">·</span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button
                            onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                            className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold"
                          >
                            Reply
                          </button>
                        )}
                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-zinc-400 hover:text-red-600 p-1 transition"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-zinc-600 text-sm mt-1.5 leading-relaxed">{comment.content}</p>
                  </div>
                </div>

                {/* Reply Editor */}
                {replyToId === comment.id && (
                  <div className="mt-3 ml-11 border-l-2 border-zinc-200 pl-4 py-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to @${comment.profiles?.username ?? 'user'}...`}
                      rows={2}
                      className="w-full rounded-xl border border-zinc-200 p-2.5 text-sm text-zinc-955 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setReplyToId(null)}
                        className="rounded-xl border border-zinc-200 px-3 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmit(comment.id)}
                        disabled={submitting || !replyContent.trim()}
                        className="rounded-xl bg-zinc-950 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
                      >
                        {submitting ? 'Replying...' : 'Send'}
                      </button>
                    </div>
                    {error && replyToId === comment.id && (
                      <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs mt-2">
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Replies list */}
                {commentReplies.length > 0 && (
                  <div className="mt-4 ml-10 space-y-4">
                    {commentReplies.map(reply => {
                      const isReplyAuthor = user && user.id === reply.author_id
                      return (
                        <div key={reply.id} className="flex gap-2.5 items-start">
                          <CornerDownRight className="w-3.5 h-3.5 text-zinc-300 mt-2 shrink-0" />
                          {reply.profiles?.avatar_url ? (
                            <img
                              src={reply.profiles.avatar_url}
                              alt={reply.profiles.username}
                              className="w-6.5 h-6.5 rounded-full object-cover border border-zinc-200/50"
                            />
                          ) : (
                            <div className="w-6.5 h-6.5 rounded-full bg-zinc-150 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                              {reply.profiles?.username?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/@${reply.profiles?.username}`}
                                  className="font-semibold text-xs text-zinc-800 hover:underline"
                                >
                                  @{reply.profiles?.username ?? 'unknown'}
                                </Link>
                                <span className="text-zinc-300 text-[10px]">·</span>
                                <span className="text-[10px] text-zinc-400">
                                  {new Date(reply.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              {isReplyAuthor && (
                                <button
                                  onClick={() => handleDelete(reply.id)}
                                  className="text-zinc-400 hover:text-red-600 p-0.5 transition"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-zinc-600 text-sm mt-1 leading-relaxed">{reply.content}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

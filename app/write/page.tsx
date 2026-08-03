'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

function EditorComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch post details if editing
  useEffect(() => {
    if (!postId) return
    async function loadPost() {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()
      if (error) {
        setError('Error loading post.')
      } else {
        setTitle(data.title)
        setContent(data.content_md)
        setCoverImage(data.cover_image || '')
        setStatus(data.status)
      }
      setLoading(false)
    }
    loadPost()
  }, [postId])

  async function handleSave(newStatus: 'draft' | 'published') {
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in.')
      setSaving(false)
      return
    }

    const slug = slugify(title)
    const payload = {
      author_id: user.id,
      title,
      slug,
      content_md: content,
      cover_image: coverImage || null,
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null,
    }

    let query
    if (postId) {
      // Update existing post
      query = supabase.from('posts').update(payload).eq('id', postId)
    } else {
      // Insert new post
      query = supabase.from('posts').insert(payload)
    }

    const { error: dbError } = await query
    setSaving(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    router.push('/dashboard')
  }

  if (loading) return <div className="max-w-2xl mx-auto py-20 text-center">Loading editor...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full text-3xl font-bold mb-6 outline-none placeholder-gray-300"
      />
      <input
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        placeholder="Cover Image URL (optional)"
        className="w-full text-sm text-zinc-500 mb-6 outline-none border-b border-zinc-100 pb-2 placeholder-zinc-300"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your post in Markdown..."
        rows={20}
        className="w-full outline-none placeholder-gray-300 font-mono text-sm resize-none"
      />

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleSave('published')}
          disabled={saving || !title || !content}
          className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Publish'}
        </button>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving || !title || !content}
          className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
        >
          Save Draft
        </button>
      </div>
    </div>
  )
}

export default function WritePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-20 text-center">Loading editor...</div>}>
      <EditorComponent />
    </Suspense>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { User, Shield, Info, ArrowLeft, Loader2, Check } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Form states
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
        setError('Failed to load profile settings.')
      } else if (profile) {
        setUsername(profile.username || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || '')
      } else {
        // If no profile entry exists yet, try to prefill from metadata
        const metadata = user.user_metadata
        setUsername(metadata?.user_name || user.email?.split('@')[0] || '')
        setAvatarUrl(metadata?.avatar_url || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setError('')
    setSuccess(false)

    const cleanedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!cleanedUsername) {
      setError('Username must not be empty and can only contain letters, numbers, and underscores.')
      setSaving(false)
      return
    }

    const { error: saveError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: cleanedUsername,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })

    setSaving(false)

    if (saveError) {
      if (saveError.message.includes('unique')) {
        setError('This username is already taken. Please choose another one.')
      } else {
        setError(saveError.message)
      }
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-950 mb-3" />
        <p className="text-sm font-medium">Loading your profile configuration...</p>
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white border border-zinc-150 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="border-b border-zinc-100 pb-5 mb-6">
          <h1 className="text-2xl font-extrabold text-zinc-950">Profile Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your public Devnotes creator identity.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full object-cover border border-zinc-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-xl">
                {username ? username[0]?.toUpperCase() : '?'}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Profile Photo</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="mt-1 block w-full sm:w-80 text-sm text-zinc-800 border-b border-zinc-200 outline-none focus:border-zinc-950 pb-1"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800">Username</label>
            <div className="relative mt-1 rounded-xl shadow-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 text-sm font-medium">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="block w-full rounded-xl border border-zinc-200 py-2.5 pl-8 pr-3 text-zinc-950 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 text-sm transition"
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 leading-normal">
              Only alphanumeric characters and underscores are allowed. This forms your public profile handle (e.g. <span className="font-semibold">/@{username || 'username'}</span>).
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other developers about yourself, your tech stack, and what you write about..."
              rows={4}
              maxLength={200}
              className="mt-1 block w-full rounded-xl border border-zinc-200 p-3 text-zinc-950 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 text-sm transition"
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-zinc-400">Brief background displayed on your stories and public profile.</p>
              <span className="text-xs text-zinc-400 font-medium">{bio.length}/200</span>
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-800 text-sm">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl p-3.5 text-green-800 text-sm">
              <Check className="w-5 h-5 shrink-0" />
              <span>Your profile configuration has been saved successfully.</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition min-w-[120px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

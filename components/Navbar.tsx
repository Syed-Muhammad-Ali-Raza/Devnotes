'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Devnotes
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Dashboard
              </Link>
              <Link href="/settings" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Settings
              </Link>
              <Link href="/write" className="bg-black text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-neutral-850 transition">
                Write
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-zinc-500 hover:text-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-800">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

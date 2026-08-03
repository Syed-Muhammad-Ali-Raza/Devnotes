'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [searchVal, setSearchVal] = useState('')

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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`)
    }
  }

  return (
    <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Devnotes
        </Link>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs mx-4">
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search stories..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition"
            aria-label="Search stories"
          />
        </form>
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

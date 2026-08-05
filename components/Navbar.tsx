'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [searchVal, setSearchVal] = useState('')

  useEffect(() => {
    async function getUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    void getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Devnotes
        </Link>
        <form onSubmit={handleSearchSubmit} className="relative mx-4 max-w-xs flex-1">
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search stories..."
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
            aria-label="Search stories"
          />
        </form>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link
                href="/bookmarks"
                className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Reading list"
              >
                <Bookmark className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline">
                Dashboard
              </Link>
              <Link href="/settings" className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 sm:inline">
                Settings
              </Link>
              <Link
                href="/write"
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Write
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-zinc-500 hover:text-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

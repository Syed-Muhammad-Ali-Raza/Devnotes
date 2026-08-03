import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Devnotes',
  description: 'Share your thoughts with the world.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-zinc-50 min-h-screen text-zinc-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}

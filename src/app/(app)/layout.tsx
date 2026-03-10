'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!appUser) router.replace('/login')
    else if (appUser.role === 'pending') router.replace('/pending')
  }, [appUser, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    )
  }

  if (!appUser || appUser.role === 'pending') return null

  return (
    <div id="app-shell" className="flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}

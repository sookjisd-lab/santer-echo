'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function PendingPage() {
  const { appUser, loading, logout, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!appUser) router.replace('/login')
    else if (appUser.role !== 'pending') router.replace('/sermon')
  }, [appUser, loading, router])

  const handleRefresh = async () => {
    await refreshUser()
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-pale">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#1F3D2A" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-text">승인 대기 중</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          가입 신청이 접수되었습니다.<br />
          관리자 승인 후 서비스를 이용할 수 있습니다.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary-dark active:scale-95"
          >
            승인 확인하기
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted transition hover:bg-primary-pale active:scale-95"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

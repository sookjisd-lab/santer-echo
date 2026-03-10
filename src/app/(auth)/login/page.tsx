'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { appUser, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!appUser) return
    if (appUser.role === 'pending') router.replace('/pending')
    else router.replace('/sermon')
  }, [appUser, loading, router])

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        {/* Church identity */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <span className="text-2xl font-bold text-white">산터</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text">산터 메아리</h1>
          <p className="mt-1 text-sm text-muted">Living Ground Community</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="mb-6 text-center text-sm text-muted">
            구글 계정으로 로그인하여<br />커뮤니티에 참여하세요
          </p>
          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white py-3 text-sm font-medium text-text transition hover:bg-primary-pale active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          로그인 후 관리자 승인이 필요합니다
        </p>
      </div>
    </div>
  )
}

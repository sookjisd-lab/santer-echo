'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AppUser } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { appUser, logout } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'users'>('pending')

  useEffect(() => {
    if (!appUser) return
    if (appUser.role !== 'admin') {
      router.replace('/sermon')
      return
    }
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map((d) => d.data() as AppUser))
      setLoading(false)
    })
    return unsub
  }, [appUser, router])

  const approveUser = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), {
      role: 'user',
      approvedAt: Timestamp.now(),
    })
  }

  const revokeUser = async (uid: string) => {
    if (!confirm('이 사용자의 권한을 취소하시겠습니까?')) return
    await updateDoc(doc(db, 'users', uid), { role: 'pending', approvedAt: null })
  }

  const deleteUser = async (uid: string) => {
    if (!confirm('이 계정을 삭제하시겠습니까?')) return
    await deleteDoc(doc(db, 'users', uid))
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const pending = users.filter((u) => u.role === 'pending')
  const active = users.filter((u) => u.role === 'user')
  const displayed = tab === 'pending' ? pending : active

  if (appUser?.role !== 'admin') return null

  return (
    <>
      <Header
        title="관리자"
        right={
          <button onClick={handleLogout} className="text-xs text-muted">
            로그아웃
          </button>
        }
      />

      {/* Tab bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab('pending')}
          className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'pending' ? 'text-primary' : 'text-muted'
          }`}
        >
          승인 대기
          {pending.length > 0 && (
            <span className="ml-1.5 rounded-full bg-danger px-1.5 py-0.5 text-xs text-white">
              {pending.length}
            </span>
          )}
          {tab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setTab('users')}
          className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
            tab === 'users' ? 'text-primary' : 'text-muted'
          }`}
        >
          멤버 ({active.length})
          {tab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          {tab === 'pending' ? '승인 대기 중인 계정이 없습니다' : '멤버가 없습니다'}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {displayed.map((u) => (
            <li key={u.uid} className="px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{u.displayName}</p>
                  <p className="truncate text-xs text-muted">{u.email}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    가입 {formatDate(u.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {tab === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveUser(u.uid)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => deleteUser(u.uid)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-danger"
                      >
                        삭제
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => revokeUser(u.uid)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted"
                    >
                      권한 취소
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

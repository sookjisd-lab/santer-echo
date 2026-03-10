'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Sermon } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDate, toDateString } from '@/lib/utils'

export default function SermonPage() {
  const { appUser } = useAuth()
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)

  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const q = query(collection(db, 'sermons'), orderBy('worshipDate', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setSermons(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Sermon))
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <>
      <Header
        title="말씀 강론"
        right={
          appUser?.role === 'admin' ? (
            <Link
              href="/sermon/new"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
            >
              + 작성
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : sermons.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          등록된 말씀이 없습니다
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {sermons.map((s) => {
            const isToday = toDateString(s.worshipDate) === todayStr
            return (
              <li key={s.id}>
                <Link
                  href={`/sermon/${s.id}`}
                  className="block px-4 py-4 transition hover:bg-primary-pale"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{s.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{formatDate(s.worshipDate)}</p>
                    </div>
                    {isToday && (
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                        오늘
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

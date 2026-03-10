'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDate } from '@/lib/utils'
import { Koinonia, PrayerTopic, AppUser } from '@/types'

type BoardItem = Koinonia | PrayerTopic

interface BoardPageProps {
  collectionName: 'koinonia' | 'prayer'
  title: string
  basePath: string
  notificationField: 'koinonia' | 'prayer'
}

export default function BoardPage({ collectionName, title, basePath, notificationField }: BoardPageProps) {
  const { appUser, refreshUser } = useAuth()
  const [items, setItems] = useState<BoardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BoardItem))
      setLoading(false)
    })
    return unsub
  }, [collectionName])

  const markRead = async (itemId: string) => {
    if (!appUser) return
    const read = appUser.readNotifications[notificationField]
    if (read.includes(itemId)) return
    await updateDoc(doc(db, 'users', appUser.uid), {
      [`readNotifications.${notificationField}`]: arrayUnion(itemId),
    })
    await refreshUser()
  }

  const unreadIds = new Set(
    items
      .filter((i) => !appUser?.readNotifications[notificationField].includes(i.id))
      .map((i) => i.id)
  )

  return (
    <>
      <Header
        title={title}
        right={
          appUser?.role === 'admin' ? (
            <Link
              href={`${basePath}/new`}
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
      ) : items.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          등록된 게시글이 없습니다
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const isUnread = unreadIds.has(item.id)
            return (
              <li key={item.id}>
                <Link
                  href={`${basePath}/${item.id}`}
                  onClick={() => markRead(item.id)}
                  className="flex items-center gap-3 px-4 py-4 transition hover:bg-primary-pale"
                >
                  {/* Unread dot */}
                  <div className={`h-2 w-2 shrink-0 rounded-full ${isUnread ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDate(item.createdAt)}</p>
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

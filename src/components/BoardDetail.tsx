'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Koinonia, PrayerTopic } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

type BoardItem = Koinonia | PrayerTopic

interface BoardDetailProps {
  id: string
  collectionName: 'koinonia' | 'prayer'
  title: string
  basePath: string
}

export default function BoardDetail({ id, collectionName, title, basePath }: BoardDetailProps) {
  const { appUser } = useAuth()
  const router = useRouter()
  const [item, setItem] = useState<BoardItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoc(doc(db, collectionName, id)).then((snap) => {
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() } as BoardItem)
      setLoading(false)
    })
  }, [id, collectionName])

  const handleDelete = async () => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return
    await deleteDoc(doc(db, collectionName, id))
    router.push(basePath)
  }

  if (loading) {
    return (
      <>
        <Header title={title} />
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      </>
    )
  }

  if (!item) {
    return (
      <>
        <Header title={title} />
        <div className="flex h-40 items-center justify-center text-sm text-muted">게시글을 찾을 수 없습니다</div>
      </>
    )
  }

  return (
    <>
      <Header
        title={title}
        right={
          appUser?.role === 'admin' ? (
            <div className="flex gap-2">
              <Link href={`${basePath}/${id}/edit`} className="text-xs font-medium text-accent">
                수정
              </Link>
              <button onClick={handleDelete} className="text-xs font-medium text-danger">
                삭제
              </button>
            </div>
          ) : undefined
        }
      />
      <div className="px-4 py-5">
        <div className="mb-1 text-xs text-muted">{formatDate(item.createdAt)}</div>
        <h2 className="text-lg font-bold text-text">{item.title}</h2>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text">{item.content}</div>
      </div>
    </>
  )
}

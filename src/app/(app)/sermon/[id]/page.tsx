'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Sermon } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function SermonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { appUser } = useAuth()
  const router = useRouter()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoc(doc(db, 'sermons', id)).then((snap) => {
      if (snap.exists()) setSermon({ id: snap.id, ...snap.data() } as Sermon)
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('이 말씀을 삭제하시겠습니까?')) return
    await deleteDoc(doc(db, 'sermons', id))
    router.push('/sermon')
  }

  if (loading) {
    return (
      <>
        <Header title="말씀 강론" />
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      </>
    )
  }

  if (!sermon) {
    return (
      <>
        <Header title="말씀 강론" />
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          게시글을 찾을 수 없습니다
        </div>
      </>
    )
  }

  return (
    <>
      <Header
        title="말씀 강론"
        right={
          appUser?.role === 'admin' ? (
            <div className="flex gap-2">
              <Link
                href={`/sermon/${id}/edit`}
                className="text-xs font-medium text-accent"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="text-xs font-medium text-danger"
              >
                삭제
              </button>
            </div>
          ) : undefined
        }
      />
      <div className="px-4 py-5">
        <div className="mb-1 text-xs text-muted">{formatDate(sermon.worshipDate)}</div>
        <h2 className="text-lg font-bold text-text">{sermon.title}</h2>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text">
          {sermon.content}
        </div>
      </div>
    </>
  )
}

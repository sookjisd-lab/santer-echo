'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Sermon } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'

export default function SermonEditPage() {
  const { id } = useParams<{ id: string }>()
  const { appUser } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [worshipDate, setWorshipDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'sermons', id)).then((snap) => {
      if (snap.exists()) {
        const s = snap.data() as Sermon
        setTitle(s.title)
        setContent(s.content)
        setWorshipDate(s.worshipDate.toDate().toISOString().slice(0, 10))
      }
      setLoading(false)
    })
  }, [id])

  if (appUser?.role !== 'admin') {
    return (
      <>
        <Header title="수정" />
        <div className="flex h-40 items-center justify-center text-sm text-muted">권한이 없습니다</div>
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'sermons', id), {
        title: title.trim(),
        content: content.trim(),
        worshipDate: Timestamp.fromDate(new Date(worshipDate)),
        updatedAt: Timestamp.now(),
      })
      router.push(`/sermon/${id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="수정" />
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="말씀 수정" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">예배 날짜</label>
          <input
            type="date"
            value={worshipDate}
            onChange={(e) => setWorshipDate(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? '저장 중...' : '수정 완료'}
        </button>
      </form>
    </>
  )
}

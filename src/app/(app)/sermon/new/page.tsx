'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'

export default function SermonNewPage() {
  const { appUser } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [worshipDate, setWorshipDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  if (appUser?.role !== 'admin') {
    return (
      <>
        <Header title="말씀 강론" />
        <div className="flex h-40 items-center justify-center text-sm text-muted">
          권한이 없습니다
        </div>
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const ts = Timestamp.fromDate(new Date(worshipDate))
      await addDoc(collection(db, 'sermons'), {
        title: title.trim(),
        content: content.trim(),
        worshipDate: ts,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        authorId: appUser.uid,
      })
      router.push('/sermon')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="말씀 작성" />
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
            placeholder="말씀 제목"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="말씀 내용을 입력하세요"
            rows={12}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? '저장 중...' : '게시하기'}
        </button>
      </form>
    </>
  )
}

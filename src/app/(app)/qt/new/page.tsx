'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { getDailyNickname } from '@/lib/utils'

export default function QtNewPage() {
  const { appUser } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const nickname = appUser ? getDailyNickname(appUser.uid) : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !appUser) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'qt'), {
        title: title.trim(),
        content: content.trim(),
        authorId: appUser.uid,
        nickname,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      router.push('/qt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="큐티 나눔" />
      <div className="px-4 pt-4">
        <div className="mb-4 rounded-xl bg-primary-pale px-3 py-2 text-sm">
          <span className="text-muted">오늘의 닉네임: </span>
          <span className="font-semibold text-primary">{nickname}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="큐티 제목"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">나눔 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 말씀에서 받은 은혜를 나눠주세요"
            rows={10}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? '저장 중...' : '나눔 올리기'}
        </button>
      </form>
    </>
  )
}

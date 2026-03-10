'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'

interface BoardFormProps {
  collectionName: 'koinonia' | 'prayer'
  title: string
  basePath: string
  initialTitle?: string
  initialContent?: string
  editId?: string
}

export default function BoardForm({
  collectionName,
  title,
  basePath,
  initialTitle = '',
  initialContent = '',
  editId,
}: BoardFormProps) {
  const { appUser } = useAuth()
  const router = useRouter()
  const [formTitle, setFormTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)

  if (appUser?.role !== 'admin') {
    return (
      <>
        <Header title={title} />
        <div className="flex h-40 items-center justify-center text-sm text-muted">권한이 없습니다</div>
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !content.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await updateDoc(doc(db, collectionName, editId), {
          title: formTitle.trim(),
          content: content.trim(),
          updatedAt: Timestamp.now(),
        })
        router.push(`${basePath}/${editId}`)
      } else {
        await addDoc(collection(db, collectionName), {
          title: formTitle.trim(),
          content: content.trim(),
          worshipDate: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          authorId: appUser.uid,
        })
        router.push(basePath)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title={editId ? `${title} 수정` : `${title} 작성`} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">제목</label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={10}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !formTitle.trim() || !content.trim()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? '저장 중...' : editId ? '수정 완료' : '게시하기'}
        </button>
      </form>
    </>
  )
}

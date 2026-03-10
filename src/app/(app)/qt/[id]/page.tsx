'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QtPost } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDateTime } from '@/lib/utils'

export default function QtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { appUser } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState<QtPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'qt', id)).then((snap) => {
      if (snap.exists()) {
        const p = { id: snap.id, ...snap.data() } as QtPost
        setPost(p)
        setEditTitle(p.title)
        setEditContent(p.content)
      }
      setLoading(false)
    })
  }, [id])

  const isOwner = post?.authorId === appUser?.uid

  const handleDelete = async () => {
    if (!confirm('이 나눔을 삭제하시겠습니까?')) return
    await deleteDoc(doc(db, 'qt', id))
    router.push('/qt')
  }

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'qt', id), {
        title: editTitle.trim(),
        content: editContent.trim(),
        updatedAt: Timestamp.now(),
      })
      setPost((p) => p ? { ...p, title: editTitle.trim(), content: editContent.trim() } : p)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header title="큐티 나눔" />
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      </>
    )
  }

  if (!post) {
    return (
      <>
        <Header title="큐티 나눔" />
        <div className="flex h-40 items-center justify-center text-sm text-muted">게시글을 찾을 수 없습니다</div>
      </>
    )
  }

  return (
    <>
      <Header
        title="큐티 나눔"
        right={
          isOwner ? (
            <div className="flex gap-3">
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-xs font-medium text-accent">
                  수정
                </button>
              )}
              <button onClick={handleDelete} className="text-xs font-medium text-danger">
                삭제
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="px-4 py-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-primary">{post.nickname}</span>
          <span className="text-xs text-muted">{formatDateTime(post.createdAt)}</span>
        </div>

        {editing ? (
          <div className="flex flex-col gap-3 mt-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-text outline-none focus:border-primary"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-text outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mt-2 text-lg font-bold text-text">{post.title}</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text">
              {post.content}
            </div>
          </>
        )}
      </div>
    </>
  )
}

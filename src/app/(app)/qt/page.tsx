'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QtPost } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import { formatDateTime, getWeekLabel, toDateString } from '@/lib/utils'

interface GroupedPosts {
  weekLabel: string
  dates: {
    dateStr: string
    posts: QtPost[]
  }[]
}

function groupByWeekAndDate(posts: QtPost[]): GroupedPosts[] {
  const weekMap = new Map<string, Map<string, QtPost[]>>()

  for (const post of posts) {
    const weekLabel = getWeekLabel(post.createdAt)
    const dateStr = toDateString(post.createdAt)
    if (!weekMap.has(weekLabel)) weekMap.set(weekLabel, new Map())
    const dateMap = weekMap.get(weekLabel)!
    if (!dateMap.has(dateStr)) dateMap.set(dateStr, [])
    dateMap.get(dateStr)!.push(post)
  }

  return Array.from(weekMap.entries()).map(([weekLabel, dateMap]) => ({
    weekLabel,
    dates: Array.from(dateMap.entries()).map(([dateStr, posts]) => ({ dateStr, posts })),
  }))
}

export default function QtPage() {
  const { appUser } = useAuth()
  const [posts, setPosts] = useState<QtPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'qt'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QtPost))
      setLoading(false)
    })
    return unsub
  }, [])

  const groups = groupByWeekAndDate(posts)
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <>
      <Header
        title="큐티 나눔"
        right={
          <Link
            href="/qt/new"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
          >
            + 나눔
          </Link>
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-border border-t-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted">
          <p>아직 나눔이 없습니다</p>
          <Link href="/qt/new" className="text-primary underline underline-offset-2">
            첫 큐티를 나눠보세요
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div key={group.weekLabel}>
              {/* Week label */}
              <div className="sticky top-14 z-[5] bg-primary-pale px-4 py-1.5">
                <span className="text-xs font-semibold text-primary">{group.weekLabel}</span>
              </div>

              {group.dates.map(({ dateStr, posts: datePosts }) => (
                <div key={dateStr}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted">
                      {dateStr === todayStr ? '오늘' : dateStr.replace(/-/g, '. ')}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Posts as chat bubbles */}
                  <div className="flex flex-col gap-4 px-4 pb-2">
                    {datePosts.map((post) => {
                      const isMe = post.authorId === appUser?.uid
                      return (
                        <Link
                          key={post.id}
                          href={`/qt/${post.id}`}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="text-xs font-medium text-muted">{post.nickname}</span>
                          </div>
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              isMe
                                ? 'rounded-tr-sm bg-primary text-white'
                                : 'rounded-tl-sm border border-border bg-surface text-text'
                            }`}
                          >
                            <p className="text-sm font-medium leading-snug line-clamp-1">
                              {post.title}
                            </p>
                            <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${isMe ? 'text-white/80' : 'text-muted'}`}>
                              {post.content}
                            </p>
                          </div>
                          <span className="mt-1 text-xs text-muted">{formatDateTime(post.createdAt)}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

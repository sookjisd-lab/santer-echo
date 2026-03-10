'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PrayerTopic } from '@/types'
import BoardForm from '@/components/BoardForm'

export default function PrayerEditPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<PrayerTopic | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'prayer', id)).then((snap) => {
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() } as PrayerTopic)
    })
  }, [id])

  if (!item) return null

  return (
    <BoardForm
      collectionName="prayer"
      title="기도 제목 나눔"
      basePath="/prayer"
      initialTitle={item.title}
      initialContent={item.content}
      editId={id}
    />
  )
}

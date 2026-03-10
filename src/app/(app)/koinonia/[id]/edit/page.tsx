'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Koinonia } from '@/types'
import BoardForm from '@/components/BoardForm'

export default function KoinoniaEditPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Koinonia | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'koinonia', id)).then((snap) => {
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() } as Koinonia)
    })
  }, [id])

  if (!item) return null

  return (
    <BoardForm
      collectionName="koinonia"
      title="코이노니아"
      basePath="/koinonia"
      initialTitle={item.title}
      initialContent={item.content}
      editId={id}
    />
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import BoardDetail from '@/components/BoardDetail'

export default function KoinoniaDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <BoardDetail
      id={id}
      collectionName="koinonia"
      title="코이노니아"
      basePath="/koinonia"
    />
  )
}

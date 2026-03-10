import BoardForm from '@/components/BoardForm'

export const dynamic = 'force-dynamic'

export default function PrayerNewPage() {
  return (
    <BoardForm
      collectionName="prayer"
      title="기도 제목 나눔"
      basePath="/prayer"
    />
  )
}

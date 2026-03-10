import BoardPage from '@/components/BoardPage'

export const dynamic = 'force-dynamic'

export default function PrayerPage() {
  return (
    <BoardPage
      collectionName="prayer"
      title="기도 제목 나눔"
      basePath="/prayer"
      notificationField="prayer"
    />
  )
}

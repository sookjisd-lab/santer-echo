import BoardPage from '@/components/BoardPage'

export const dynamic = 'force-dynamic'

export default function KoinoniaPage() {
  return (
    <BoardPage
      collectionName="koinonia"
      title="코이노니아"
      basePath="/koinonia"
      notificationField="koinonia"
    />
  )
}

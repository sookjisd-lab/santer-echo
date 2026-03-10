import BoardForm from '@/components/BoardForm'

export const dynamic = 'force-dynamic'

export default function KoinoniaNewPage() {
  return (
    <BoardForm
      collectionName="koinonia"
      title="코이노니아"
      basePath="/koinonia"
    />
  )
}

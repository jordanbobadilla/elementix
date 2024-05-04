import BlurPage from '@/components/global/blur-page'
import MediaComponent from '@/components/media'
import { getMedia } from '@/lib/queries'
import React from 'react'

type Props = {
  params: {
    subaccountId: string
  }
}

const MediaPage = async ({params}: Props) => {
  const data = await getMedia(params.subaccountId)

  return (
    <BlurPage>
      <MediaComponent data={data} subAccountId={params.subaccountId}/>
    </BlurPage>
  )
}

export default MediaPage
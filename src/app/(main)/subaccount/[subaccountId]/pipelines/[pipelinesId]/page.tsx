import { Tabs, TabsList } from '@/components/ui/tabs'
import { db } from '@/lib/db'
import { getLanesWithTicketsAndTags, getPipelinesDetails } from '@/lib/queries'
import { LaneDetail } from '@/lib/types'
import { redirect } from 'next/navigation'
import React from 'react'
import PipelinesInfobar from '../_components/pipelines-infobar'

type Props = {
  params: {
    subaccountId: string
    pipelinesId: string
  }
}

const PipelinesPage = async ({params}: Props) => {
  const pipelinesDetails = await getPipelinesDetails(params.pipelinesId)

  if (!pipelinesDetails) {
    return redirect(`/subaccount/${params.subaccountId}/pipelines`)
  }

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: params.subaccountId}
  })

  const lanes = (await getLanesWithTicketsAndTags(
    params.pipelinesId
  )) as LaneDetail[]

  return (
    <Tabs defaultValue='view' className='w-full'>
      <TabsList className='bg-transparent border-b-2 h-16 w-full justify-between mb-4'>
        <PipelinesInfobar subAccountId={params.subaccountId} pipelines={pipelines} pipelineId={params.pipelinesId}/>
      </TabsList>
    </Tabs>
  )
}

export default PipelinesPage
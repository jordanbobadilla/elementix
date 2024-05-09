'use client'
import React from 'react'
import PipelineInfobar from './pipelines-infobar'
import { Pipeline } from '@prisma/client'
import CreatePipelineForm from '@/components/forms/create-pipeline-form'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePipeline, saveActivityLogsNotification } from '@/lib/queries'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

const PipelineSettings = ({
  pipelineId,
  subaccountId,
  pipelines,
}: {
  pipelineId: string
  subaccountId: string
  pipelines: Pipeline[]
}) => {
  const router = useRouter()
  return (
    <AlertDialog>
      <div>
      <CreatePipelineForm
          subAccountId={subaccountId}
          defaultData={pipelines.find((pipeline) => pipeline.id === pipelineId)}
        />
        <div className="w-full flex items-center justify-end mt-4">
          <AlertDialogTrigger asChild >
            <Button variant={'destructive'} className='w-full md:w-80 '>Delete Pipeline</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className='bg-destructive hover:bg-red-600'
                onClick={async () => {
                  try {
                    const response = await deletePipeline(pipelineId)
                    await saveActivityLogsNotification({
                      agencyId: undefined,
                      description: `Deleted a pipeline | ${response.name}}`
                    })
                    toast({
                      title: 'Deleted',
                      description: 'Pipeline is deleted',
                    })
                    router.replace(`/subaccount/${subaccountId}/pipelines`)
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oppse!',
                      description: 'Could Delete Pipeline',
                    })
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>
      </div>
    </AlertDialog>
  )
}

export default PipelineSettings
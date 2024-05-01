"use client"
import { deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  subAccountId: string
}

const DeleteButton = ({subAccountId}: Props) => {
  const router = useRouter()
  return (
    <div onClick={async () => {
      const response = await getSubaccountDetails(subAccountId)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Deleted a subaccount | ${response?.name}`,
        subaccountId: subAccountId,
      })
      await deleteSubAccount(subAccountId)
      router.refresh()
    }}>
      Delete Sub Account
    </div>
  )
}

export default DeleteButton
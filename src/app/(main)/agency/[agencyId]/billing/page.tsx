import { Separator } from "@/components/ui/separator"
import React from "react"

type Props = {
  params: { agencyId: string }
}

const Page = ({ params }: Props) => {
  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className="mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
    </>
  )
}

export default Page

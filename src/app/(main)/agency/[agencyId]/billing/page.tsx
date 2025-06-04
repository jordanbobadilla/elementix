import { Separator } from "@/components/ui/separator"
import { addOnProducts, pricingCards } from "@/lib/constans"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import React from "react"
import PricingCard from "./_components/pricing-card"

type Props = {
  params: { agencyId: string }
}

const BillingPage = async ({ params }: Props) => {
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ["data.default_price"],
  })

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  const prices = await stripe.prices.list({
    product: process.env.NEXT_ELEMNTIX_PRODUCT_ID,
    active: true,
  })

  const currentPlanDetails = pricingCards.find(
    (card) => card.priceId === agencySubscription?.Subscription?.priceId
  )

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  })

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: "Paid",
      amount: `$${charge.amount / 100}`,
    })),
  ]

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className="mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices.data}
          //@ts-ignore
          customerId={agencySubscription?.customerId}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || "$0"
              : "$0"
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? "Change Plan"
              : "Get Started"
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have further question contact support@elementix.com"
          highlightTitle="Plan Options"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || "Let's get started"
              : "Let's get started! Pick a plan that works best for you."
          }
          duration="/month"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || pricingCards.find((card) => card.title === "Starter")?.features || []
              : pricingCards.find((card) => card.title === "Starter")?.features || []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || "Starter"
              : "Starter"
          }
        />
      </div>
    </>
  )
}

export default BillingPage

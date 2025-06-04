import Stripe from "stripe"
import { db } from "../db"
import { stripe } from "."

export const subscriptionCreated = async (
  subscription: Stripe.SubscriptionItem,
  customerId: string
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        SubAccounts: true,
      },
    })
    if (!agency) {
      throw new Error("Could not find an agency to upsert the subscription")
    }

    const data = {
      active: subscription.price.active,
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 1000),
      priceId: subscription.price.id,
      subscritiptionId: subscription.id,
      plan: subscription.plan.id,
    }

    const response = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      //@ts-ignore
      create: data,
      //@ts-ignore
      update: data,
    })
    console.log(`Created Subscription for ${subscription.id}`)
  } catch (error) {
    console.log(`Error from Create Action`, error)
  }
}

export const getConnectedAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ["data.default_price"]
    },
    {
      stripeAccount
    }
  )
  return products.data
}

import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json()

  if (!customerId || !priceId) {
    return new NextResponse("Customer ID or Price ID is missing", {
      status: 400,
    })
  }

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: { Subscription: true },
  })

  try {
    // 🔁 ACTUALIZAR SI YA EXISTE
    if (
      subscriptionExists?.Subscription?.subscritiptionId &&
      subscriptionExists.Subscription.active
    ) {
      const subscriptionId = subscriptionExists.Subscription.subscritiptionId
      if (!subscriptionId) {
        throw new Error("No subscription ID found to update.")
      }

      const current = await stripe.subscriptions.retrieve(subscriptionId)

      const updated = await stripe.subscriptions.update(subscriptionId, {
        items: [
          { id: current.items.data[0].id, deleted: true },
          { price: priceId },
        ],
        expand: ["latest_invoice.payment_intent"],
      })

      //@ts-ignore
      const clientSecret = updated.latest_invoice?.payment_intent?.client_secret ?? null

      return NextResponse.json({
        subscriptionId: updated.id,
        clientSecret,
      })
    }

    // 🆕 CREAR NUEVA SUSCRIPCIÓN
    const created = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    })

    //@ts-ignore
    const clientSecret = created.latest_invoice?.payment_intent?.client_secret ?? null

    return NextResponse.json({
      subscriptionId: created.id,
      clientSecret,
    })
  } catch (error) {
    console.error("❌ Error in subscription route:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

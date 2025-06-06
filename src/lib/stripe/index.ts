import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  //@ts-ignore
  apiVersion: "2024-04-10",
  appInfo: {
    name: "Elementix",
    version: "0.1.0",
  },
})

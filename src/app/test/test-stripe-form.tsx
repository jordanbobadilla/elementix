"use client"

import { useMemo } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const clientSecret = "pi_3RWxyzIf3DKNWBXw1ABCD123_secret_456xyz" // ← Sustituye con uno válido real de prueba

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const card = elements.getElement(CardElement)
    if (!card) return

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card },
      }
    )

    if (error) {
      console.error("Error:", error.message)
    } else {
      console.log("Success:", paymentIntent)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded space-y-4 max-w-md mx-auto mt-8"
    >
      <h2 className="text-lg font-bold">Introduce tu tarjeta</h2>
      <CardElement />
      <Button type="submit" className="w-full">
        Pagar
      </Button>
    </form>
  )
}

const TestStripeForm = () => {
  const options = useMemo(() => ({ clientSecret }), [])

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  )
}

export default TestStripeForm

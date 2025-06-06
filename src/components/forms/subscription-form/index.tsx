"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Plan } from "@prisma/client"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"

type Props = {
  clientSecret: string | null
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ clientSecret, selectedPriceId }: Props) => {
  const { toast } = useToast()
  const elements = useElements()
  const stripe = useStripe()
  const [priceError, setPriceError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedPriceId) {
      setPriceError("You need to select a plan to subscribe.")
      return
    }

    if (!stripe || !elements) return

    if (!clientSecret) {
      toast({
        variant: "destructive",
        title: "Missing Payment Intent",
        description:
          "No se pudo generar el intento de pago. Intenta más tarde.",
      })
      return
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      })

      if (result.error) {
        console.error(result.error)
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description:
            result.error.message ?? "Ocurrió un error al procesar el pago.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "No se pudo procesar el pago. Intenta de nuevo.",
      })
    }
  }

  console.log("Stripe hook:", stripe)
  console.log("Elements hook:", elements)

  return (
    <form onSubmit={handleSubmit}>
      {priceError && (
        <small className="text-destructive block mb-2">{priceError}</small>
      )}
      <PaymentElement />
      <Button
        disabled={!stripe || !elements}
        type="submit"
        className="mt-4 w-full"
      >
        Submit
      </Button>
    </form>
  )
}

export default SubscriptionForm

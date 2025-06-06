import dynamic from "next/dynamic"

const TestStripeForm = dynamic(() => import("@/app/test/test-stripe-form"), {
  ssr: false,
})

export default function TestPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <TestStripeForm />
    </main>
  )
}

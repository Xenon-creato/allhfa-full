import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

const PACKAGES: Record<string, {
  name: string
  credits: number
  price: number
}> = {
  starter: { name: "Starter", credits: 8, price: 1 },
  basic: { name: "Basic", credits: 50, price: 5 },
  pro: { name: "Pro", credits: 150, price: 12 },
  ultimate: { name: "Ultimate", credits: 500, price: 35 },
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { package?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  const packageId = searchParams.package
  if (!packageId || !PACKAGES[packageId]) {
    redirect("/pricing")
  }

  const pkg = PACKAGES[packageId]

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full border border-zinc-800 rounded-xl p-6 bg-zinc-900">
        <h1 className="text-2xl font-bold mb-4">
          Confirm purchase
        </h1>

        <div className="space-y-2 text-zinc-300 mb-6">
          <div className="flex justify-between">
            <span>Package</span>
            <span>{pkg.name}</span>
          </div>

          <div className="flex justify-between">
            <span>Credits</span>
            <span>{pkg.credits}</span>
          </div>

          <div className="flex justify-between font-semibold text-white">
            <span>Total</span>
            <span>${pkg.price}</span>
          </div>
        </div>

        <form action="/api/payments/create" method="POST">
          <input type="hidden" name="packageId" value={packageId} />

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            Continue to payment
          </button>
        </form>

        <p className="text-xs text-zinc-500 mt-4 text-center">
          No subscription. One-time payment.
        </p>
      </div>
    </div>
  )
}

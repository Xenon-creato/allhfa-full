"use client"

import { useEffect, useState } from "react"

type PaymentStatus = "waiting" | "confirming" | "finished" | "failed"

export default function PaymentPage({
  params,
}: {
  params: { orderId: string }
}) {
  const [status, setStatus] = useState<PaymentStatus>("waiting")

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${params.orderId}`)
        const data = await res.json()

        if (data.status) {
          setStatus(data.status)

          if (data.status === "finished" || data.status === "failed") {
            clearInterval(interval)
          }
        }
      } catch (e) {
        console.error("STATUS CHECK ERROR", e)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [params.orderId])

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      {(status === "waiting" || status === "confirming") && (
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            Waiting for payment confirmation…
          </div>
          <p className="text-zinc-400">
            Do not close this page
          </p>
        </div>
      )}

      {status === "finished" && (
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">
            ✅ Payment successful
          </div>
          <p className="text-zinc-400">
            Credits have been added
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center text-red-500">
          ❌ Payment failed
        </div>
      )}
    </main>
  )
}

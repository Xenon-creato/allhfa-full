"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const MAX_WAIT_TIME = 5 * 60 * 1000

export function PaymentWatcher({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [expired, setExpired] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const startedAt = Date.now()

    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/${orderId}`)
      if (!res.ok) return

      const data = await res.json()

      if (data.status === "finished") {
        clearInterval(interval)

        // 🔑 КРОК 2 викликається ТУТ (1 раз)
        await fetch(`/api/payment/${orderId}/process`, {
          method: "POST",
        })

        setSuccess(true)

        setTimeout(() => {
          router.replace("/")
        }, 2000)
      }

      if (Date.now() - startedAt > MAX_WAIT_TIME) {
        clearInterval(interval)
        setExpired(true)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, router])

  if (success) {
    return (
      <div className="mt-6 text-center">
        <p className="text-green-400 font-semibold mb-2">
          ✅ Payment confirmed
        </p>
        <p className="text-xs text-zinc-500">
          Credits were added to your account.
          <br />
          Redirecting…
        </p>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-zinc-400 mb-2">
          Payment confirmation is taking longer than usual.
        </p>
        <button
          onClick={() => location.reload()}
          className="text-sm text-indigo-400 hover:underline"
        >
          Refresh status
        </button>
      </div>
    )
  }

  return (
    <p className="mt-4 text-xs text-zinc-500 text-center">
      Waiting for payment confirmation…
    </p>
  )
}

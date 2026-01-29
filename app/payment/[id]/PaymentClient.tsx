"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function PaymentClient({ orderId }: { orderId: string }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/payment/status/${orderId}`)

      if (!res.ok) return

      const data = await res.json()

      if (data.status === "finished") {
        router.replace("/")
      }

      if (data.status === "failed" || data.status === "expired") {
        router.replace("/pricing")
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [orderId, router])

  return null
}

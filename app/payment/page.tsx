import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/api/auth/signin")
  }

  const payments = await prisma.payment.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Payment history</h1>

      {payments.length === 0 && (
        <p className="text-zinc-400">No payments yet.</p>
      )}

      <div className="space-y-3">
        {payments.map(p => (
          <div
            key={p.id}
            className="border border-zinc-800 rounded-lg p-4 flex justify-between items-center bg-zinc-900"
          >
            <div>
              <p className="text-sm font-mono text-zinc-300">
                {p.orderId}
              </p>
              <p className="text-xs text-zinc-500">
                {new Date(p.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {p.amount} {p.currency}
              </p>
              <p
                className={`text-xs ${
                  p.status === "finished"
                    ? "text-green-400"
                    : p.status === "pending"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {p.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

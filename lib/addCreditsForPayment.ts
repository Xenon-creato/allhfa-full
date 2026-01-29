import { prisma } from "@/lib/prisma"
import { PACKAGES } from "@/lib/packages"

export async function addCreditsForPayment(paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      throw new Error("Payment not found")
    }

    // ✅ тільки finished
    if (payment.status !== "finished") {
      return { ok: false, reason: "not_finished" }
    }

    // 🛡️ захист від дубля
    if (payment.creditsAdded) {
      return { ok: true, alreadyAdded: true }
    }

    const credits = PACKAGES[payment.packageId]
    if (!credits) {
      throw new Error("Invalid package")
    }

    await tx.user.update({
      where: { id: payment.userId },
      data: {
        credits: { increment: credits },
      },
    })

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        creditsAdded: true,
      },
    })

    return { ok: true, added: credits }
  })
}

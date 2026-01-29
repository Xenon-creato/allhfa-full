import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!

function mapNowPaymentsStatus(status: string) {
  switch (status) {
    case "waiting":
      return "waiting"
    case "confirming":
    case "sending":
      return "confirming"
    case "confirmed":
    case "finished":
      return "finished"
    default:
      return "failed"
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-nowpayments-sig")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac("sha512", NOWPAYMENTS_IPN_SECRET)
    .update(rawBody)
    .digest("hex")

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
  }

  const data = JSON.parse(rawBody)

  const {
    payment_id,
    payment_status,
    order_id,
    pay_amount,
    pay_currency,
  } = data

  const payment = await prisma.payment.findUnique({
    where: { orderId: order_id },
    select: {
      status: true,
      userId: true,
      packageId: true,
    },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  const newStatus = mapNowPaymentsStatus(payment_status)

  const isFirstFinish =
    payment.status !== "finished" && newStatus === "finished"

  await prisma.$transaction(async (tx) => {
    if (isFirstFinish) {
      // ⚠️ ПРИКЛАД: заміни на свою реальну логіку пакетів
      const creditsByPackage: Record<string, number> = {
        basic: 50,
        pro: 200,
        ultra: 500,
      }

      const credits = creditsByPackage[payment.packageId] ?? 0

      await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: credits,
          },
        },
      })
    }

    await tx.payment.update({
      where: { orderId: order_id },
      data: {
        status: newStatus,
        payAmount: pay_amount,
        payCurrency: pay_currency,
      },
    })
  })

  return NextResponse.json({ ok: true })
}

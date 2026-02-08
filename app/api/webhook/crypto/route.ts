import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-nowpayments-sig");
  const isDev = process.env.NODE_ENV === "development";

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }


  const expectedSignature = crypto
    .createHmac("sha512", NOWPAYMENTS_IPN_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }




  const data = JSON.parse(rawBody);

  const { payment_status, order_id, payment_id } = data;

  // ✅ РЕАЛЬНО ФІНАЛЬНІ СТАТУСИ
  if (!["finished", "confirmed"].includes(payment_status)) {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId: order_id },
    });

    if (!payment) {
      console.warn("Payment not found:", order_id);
      return;
    }

    // ✅ ЗАХИСТ ВІД ДУБЛЯ
    if (payment.creditsAdded) {
      return;
    }

    const PACKAGE_CREDITS: Record<string, number> = {
      starter_10: 80,
      basic_15: 160,
      pro_25: 400,
      ultimate_35: 900,
    };

    const credits = PACKAGE_CREDITS[payment.packageId];
    if (!credits) {
      throw new Error("Invalid packageId: " + payment.packageId);
    }

    await tx.user.update({
      where: { id: payment.userId },
      data: {
        credits: { increment: credits },
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: payment_status,
        paymentId: String(payment_id),
        creditsAdded: true,
      },
    });
  });

  return NextResponse.json({ ok: true });
}

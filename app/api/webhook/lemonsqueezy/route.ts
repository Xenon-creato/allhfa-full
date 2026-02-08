import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const LEMON_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

const VARIANT_CREDITS: Record<number, number> = {
  1289856: 80,
  1289860: 160,
  1289861: 400,
  1289862: 900,
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", LEMON_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "order_paid") {
    return NextResponse.json({ ok: true });
  }

  const order = event.data;
  const variantId = Number(order.first_order_item?.variant_id);
  const credits = VARIANT_CREDITS[variantId];

  if (!credits) {
    console.warn("Unknown variant:", variantId);
    return NextResponse.json({ ok: true });
  }

  const email = order.user_email;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.warn("User not found:", email);
      return;
    }

    const exists = await tx.payment.findFirst({
      where: {
        provider: "lemonsqueezy",
        providerEventId: String(order.id),
      },
    });

    if (exists) return;

    await tx.user.update({
      where: { id: user.id },
      data: {
        credits: { increment: credits },
      },
    });

    await tx.payment.create({
      data: {
        orderId: String(order.id),
        provider: "lemonsqueezy",
        providerEventId: String(order.id),
        packageId: `variant_${variantId}`,
        amount: order.total / 100,
        currency: order.currency,
        status: "finished",
        creditsAdded: true,
        userId: user.id,
      },
    });
  });

  return NextResponse.json({ ok: true });
}

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// mapping package → credits
const packageToCredits: Record<string, number> = {
  starter_10: 80,
  basic_15: 160,
  pro_25: 400,
  ultimate_35: 900,
};

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const packageId = session.metadata?.packageId;
  const orderId = session.id;

  if (!userId || !packageId) {
    return NextResponse.json({ error: "Missing metadata in session" }, { status: 400 });
  }

  // перевірка на idempotency
  const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
  if (existingPayment) return NextResponse.json({ received: true });

  const credits = packageToCredits[packageId];
  if (!credits) {
    console.error("Unknown packageId:", packageId);
    return NextResponse.json({ error: "Unknown package" }, { status: 400 });
  }

  // транзакція: створюємо payment + нараховуємо кредити
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        orderId,
        provider: "stripe",
        providerEventId: event.id,
        packageId,
        amount: session.amount_total! / 100,
        currency: session.currency!,
        status: "finished",
        userId,
        creditsAdded: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: credits } },
    }),
  ]);

  return NextResponse.json({ received: true });
}

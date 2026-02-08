import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// конвертуємо packageId у ціну та кількість кредитів
export const packagePrices: Record<string, number> = {
  starter_10: 80,
  basic_15: 160,
  pro_25: 400,
  ultimate_35: 900,
};


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await req.json();

    if (!packageId || !packagePrices[packageId]) {
      return NextResponse.json({ error: "Invalid packageId" }, { status: 400 });
    }

    const amountUsd = packagePrices[packageId];

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: packageId },
            unit_amount: Math.round(amountUsd * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        packageId, // дуже важливо для webhook
      },
      success_url: `${process.env.NEXTAUTH_URL}/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}

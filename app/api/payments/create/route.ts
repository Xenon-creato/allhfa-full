import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

const PACKAGES: Record<string, number> = {
  starter_10: 80,
  basic_15: 160,
  pro_25: 400,
  ultimate_35: 900,
};

const PRICES: Record<string, number> = {
  starter_10: 10.5,
  basic_15: 15,
  pro_25: 25,
  ultimate_35: 35,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await req.json();
    if (!packageId || !PACKAGES[packageId]) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orderId = crypto.randomUUID();
    const amount = PRICES[packageId];

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: "APP_URL is not set" }, { status: 500 });
    }

    const npRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        order_id: orderId,
        order_description: `Credits pack: ${packageId}`,
        ipn_callback_url: `${baseUrl}/api/webhook/crypto`,
        success_url: `${baseUrl}/pricing`,
        cancel_url: `${baseUrl}/pricing`,
      }),
    });

    const npData = await npRes.json();

    if (!npRes.ok || !npData.id || !npData.invoice_url) {
      console.error("NOWPAYMENTS ERROR:", npData);
      return NextResponse.json({ error: "Payment provider error" }, { status: 500 });
    }

    await prisma.payment.create({
      data: {
        orderId,
        provider: "nowpayments",
        packageId,
        amount,
        currency: "usd",
        status: "pending",
        userId: user.id,
        paymentId: String(npData.id),
        invoiceUrl: npData.invoice_url,
        // payAddress/payAmount/payCurrency НЕ задаємо — нехай будуть null
      },
    });

    return NextResponse.json({ orderId, invoiceUrl: npData.invoice_url });
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


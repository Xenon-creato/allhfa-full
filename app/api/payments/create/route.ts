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
    // 1️⃣ SESSION
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ BODY
    const { packageId } = await req.json();

    if (!packageId || !PACKAGES[packageId]) {
      return NextResponse.json(
        { error: "Invalid package" },
        { status: 400 }
      );
    }

    // 3️⃣ USER
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 4️⃣ ORDER DATA
    const orderId = crypto.randomUUID();
    const amount = PRICES[packageId];

    // 5️⃣ CREATE INVOICE IN NOWPAYMENTS
    const npRes = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd", // ❗ lowercase
        order_id: orderId,
        order_description: packageId,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/crypto`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      }),
    });

    
    const npData = await npRes.json();
    console.log("NOWPAYMENTS STATUS:", npRes.status);
    console.log("NOWPAYMENTS RESPONSE:", npData);

    if (!npRes.ok || !npData.id || !npData.invoice_url) {
      console.error("NOWPAYMENTS ERROR:", npData);
      return NextResponse.json(
        { error: "Payment provider error" },
        { status: 500 }
      );
    }

    // 6️⃣ SAVE PAYMENT IN DB
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

        // ⬇️ тимчасові значення (будуть оновлені webhookʼом)
        payAddress: "",
        payAmount: amount,
        payCurrency: "usd",
      },
    });


    // 7️⃣ RETURN DATA TO FRONTEND
    return NextResponse.json({
      orderId,
      invoiceUrl: npData.invoice_url,
    });
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

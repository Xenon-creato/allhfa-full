// app/api/payments/paddle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid"; // для orderId

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ перевірка сесії/даних
    const userId = body.userId;
    const packageId = String(body.packageId);
    const amount = Number(body.amount);
    const currency = String(body.currency);

    if (!userId) return NextResponse.json({ error: "No userId provided" }, { status: 400 });

    // 1️⃣ Генеруємо унікальний orderId
    const orderId = uuidv4();

    // 2️⃣ Створюємо Payment у базі
    const payment = await prisma.payment.create({
      data: {
        userId,
        packageId,
        provider: "paddle",
        status: "waiting",
        amount,
        currency,
        orderId, // тепер обов'язкове поле заповнене
      },
    });

    // 3️⃣ Генеруємо Paddle checkout
    const paddleRes = await fetch("https://vendors.paddle.com/api/2.0/product/generate_pay_link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: process.env.PADDLE_VENDOR_ID,
        vendor_auth_code: process.env.PADDLE_API_KEY,
        title: `Credits Package ${packageId}`,
        price: amount,
        quantity: 1,
        passthrough: JSON.stringify({ orderId: payment.id, userId }),
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      }),
    });

    const data = await paddleRes.json();

    if (!data.success) {
      return NextResponse.json({ error: "Failed to create Paddle checkout", details: data }, { status: 500 });
    }

    // 4️⃣ Зберігаємо checkout URL у Payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paddleCheckoutUrl: data.response.url },
    });

    return NextResponse.json({ checkoutUrl: data.response.url, paymentId: payment.id });
  } catch (error) {
    console.error("Paddle create payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

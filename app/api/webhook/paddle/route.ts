// app/api/webhook/paddle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Функція для перевірки підпису від Paddle
function verifyPaddleSignature(body: Record<string, any>, signature: string, vendorId: string, vendorKey: string) {
  const sortedKeys = Object.keys(body).filter(k => k !== "p_signature").sort();
  const values: any[] = [];

  for (const key of sortedKeys) {
    let value = body[key];
    if (Array.isArray(value) || typeof value === "object") {
      value = JSON.stringify(value);
    }
    values.push(value);
  }

  const concatenated = values.join("");
  const hash = crypto.createHmac("sha1", vendorKey).update(concatenated).digest("hex");

  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData(); // Paddle присилає як x-www-form-urlencoded
    const parsed: Record<string, any> = {};
    body.forEach((v, k) => { parsed[k] = v; });

    const signature = parsed["p_signature"];
    if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

    const valid = verifyPaddleSignature(parsed, signature, process.env.PADDLE_VENDOR_ID!, process.env.PADDLE_API_KEY!);
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    // Беремо orderId із passthrough
    const passthrough = JSON.parse(parsed["passthrough"]);
    const paymentId = passthrough.paymentId;
    const userId = passthrough.userId;

    // Оновлюємо Payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "finished",
        paddleEmail: parsed["email"],
      },
    });

    // Нараховуємо кредити користувачу (за packageId)
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const creditsToAdd = Math.round(payment.amount); // або логіка по пакету
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: creditsToAdd } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

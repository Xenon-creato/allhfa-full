// app/api/checkout/route.ts
import { NextResponse } from "next/server";

// Тимчасова заглушка для деплою без Stripe/Paddle
export async function POST() {
  return NextResponse.json(
    { error: "Checkout is currently disabled" },
    { status: 503 }
  );
}


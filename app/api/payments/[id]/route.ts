import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payment = await prisma.payment.findUnique({
    where: { orderId: params.id },
    select: {
      amount: true,
      currency: true,
      invoiceUrl: true,
      status: true,
    },
  });

  if (!payment) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(payment);
}

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    amount: payment.amount,
    currency: payment.currency,
    invoiceUrl: payment.invoiceUrl,
    status: payment.status,
  });
}

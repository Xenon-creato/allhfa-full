import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const payment = await prisma.payment.findUnique({
    where: { orderId: id },
    select: {
      status: true,
    },
  })
  if (!id) {
    return Response.json(
      { error: "Missing order id" },
      { status: 400 }
    )
  }



  if (!payment) {
    return Response.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  return Response.json({ status: payment.status })
}

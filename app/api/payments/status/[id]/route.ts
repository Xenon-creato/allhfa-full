import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  if (!id) {
    return Response.json(
      { error: "Missing order id" },
      { status: 400 }
    )
  }

  const payment = await prisma.payment.findUnique({
    where: { orderId: id },
    select: {
      status: true,
    },
  })

  if (!payment) {
    return Response.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  return Response.json({ status: payment.status })
}

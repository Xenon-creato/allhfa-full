import { addCreditsForPayment } from "@/lib/addCreditsForPayment"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  await addCreditsForPayment(id)

  return NextResponse.json({ ok: true })
}

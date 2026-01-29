import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.credits <= 0) {
    return NextResponse.json(
      { error: "Not enough credits" },
      { status: 402 }
    );
  }

  // 👉 списуємо 1 кредит ТІЛЬКИ ПІСЛЯ onLoad
  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: {
        decrement: 1,
      },
    },
  });

  return NextResponse.json({ ok: true });
}

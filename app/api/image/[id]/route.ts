import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/r2";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await prisma.image.findUnique({
    where: { id: params.id },
  });

  if (!image || image.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // ⬇️ витягуємо key з R2 URL
  const key = image.imageUrl.split(".r2.dev/")[1];

  // 1️⃣ видаляємо з R2
  await deleteImage(key);

  // 2️⃣ видаляємо з БД
  await prisma.image.delete({
    where: { id: image.id },
  });

  return NextResponse.json({ success: true });
}

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteImage } from "@/lib/r2";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await prisma.image.findUnique({
    where: { id },
  });

  if (!image || image.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 🔐 Безпечне отримання R2 key
  let key: string | null = null;

  try {
    const url = new URL(image.imageUrl);
    key = url.pathname.startsWith("/")
      ? url.pathname.slice(1)
      : url.pathname;
  } catch {
    return NextResponse.json(
      { error: "Invalid image URL" },
      { status: 400 }
    );
  }

  // 1️⃣ delete from R2
  await deleteImage(key);

  // 2️⃣ delete from DB
  await prisma.image.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

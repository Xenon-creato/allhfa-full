import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import { fal, ApiError } from "@fal-ai/client";

export const runtime = "nodejs";

// Налаштовуємо Fal (шукає FAL_KEY у .env)
fal.config({ credentials: process.env.FAL_KEY });

export async function POST(req: Request) {
  try {
    // ================= AUTH CHECK =================
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // ================= USER & CREDITS CHECK =================
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits <= 0) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
    }

    // ================= AI GENERATION =================
    let imageBuffer: Buffer;
    try {
      console.log("Starting generation with Fal.ai for prompt:", prompt);

      const result = await fal.run("fal-ai/flux/dev", {
        input: {
          prompt,
          image_size: "landscape_4_3",
        },
      });

      // ⚠ Fal SDK не має точних типів → приводимо до any
      const anyResult: any = result;

      // Перевіряємо на пустий результат або порожній баланс
      const imageUrl = anyResult?.images?.[0]?.url;
      if (!imageUrl) {
        return NextResponse.json(
          { error: "The site is currently not working. Please come back later." },
          { status: 503 }
        );
      }

      // Завантажуємо згенероване зображення в Buffer
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error("Failed to fetch generated image");
      const arrayBuffer = await imageRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);

    } catch (err: any) {
      console.error("Fal.ai Error:", err);

      // Якщо 401 або порожній баланс
      if (err instanceof ApiError && err.status === 401) {
        return NextResponse.json(
          { error: "The site is currently not working. Please come back later." },
          { status: 503 }
        );
      }

      return NextResponse.json({ error: err.message || "AI generation failed" }, { status: 503 });
    }

    // ================= R2 UPLOAD =================
    let finalImageUrl: string;
    try {
      const key = `users/${user.id}/${Date.now()}.png`;
      finalImageUrl = await uploadImage({
        buffer: imageBuffer,
        key,
        contentType: "image/png",
      });
    } catch (err) {
      console.error("R2 upload failed:", err);
      return NextResponse.json({ error: "Storage upload failed" }, { status: 503 });
    }

    // ================= DB WRITE =================
    const image = await prisma.image.create({
      data: {
        userId: user.id,
        prompt,
        imageUrl: finalImageUrl,
      },
    });

    // ================= SUCCESS =================
    return NextResponse.json({ image });

  } catch (error) {
    console.error("GENERATE ROUTE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

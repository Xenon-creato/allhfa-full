import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import { fal, ApiError } from "@fal-ai/client";
import { rateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit(req);
  const creds = process.env.FAL_KEY || "";
  console.log("FAL_KEY present:", !!creds);
  console.log("FAL_KEY hasColon:", creds.includes(":"));
  console.log("FAL_KEY len:", creds.length);
  console.log("FAL_KEY prefix:", creds.slice(0, 12)); // безпечно

  fal.config({ credentials: creds });

  if (limit) return limit; // якщо ліміт перевищено, поверне 429
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

      const result = await fal.run("fal-ai/flux/dev", {
        input: {
          prompt,
          image_size: "landscape_4_3",
        },
      });
      const anyResult: any = result;
      // покажемо тільки ключі верхнього рівня
      console.log("FAL result keys:", Object.keys(anyResult || {}));

      // покажемо можливі місця з картинками
      console.log("FAL result.images:", anyResult?.images);
      console.log("FAL result.output.images:", anyResult?.output?.images);
      console.log("FAL result.data.images:", anyResult?.data?.images);

      // (опційно) якщо є error/message
      console.log("FAL result.error:", anyResult?.error || anyResult?.message);

      // ⚠ Fal SDK не має точних типів → приводимо до any


      // Перевіряємо на пустий результат або порожній баланс
      const imageUrl =
        anyResult?.images?.[0]?.url ||
        anyResult?.output?.images?.[0]?.url ||
        anyResult?.data?.images?.[0]?.url ||
        anyResult?.image?.url ||
        anyResult?.output?.image?.url ||
        anyResult?.data?.image?.url;
      if (!imageUrl) {
        console.error("Fal returned no image URL. Full keys:", Object.keys(anyResult || {}));
        return NextResponse.json(
          { error: "Fal returned no image URL" },
          { status: 502 }
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
    if (err instanceof ApiError) {
      console.error("Fal ApiError status:", err.status);
      console.error("Fal ApiError body:", (err as any).body);

      return NextResponse.json(
        { error: "Fal API error", status: err.status, body: (err as any).body },
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

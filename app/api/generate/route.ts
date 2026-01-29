import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import { fal } from "@fal-ai/client"; // Імпортуємо Fal

export const runtime = "nodejs";

// Налаштовуємо Fal (він автоматично шукає FAL_KEY в env)
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true },
    });

    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
    }

    /* ================= REAL IMAGE GENERATION ================= */
    console.log("Starting generation with Fal.ai for prompt:", prompt);
    
    let imageBuffer: Buffer;
    
    try {
      // Виклик моделі через новий клієнт @fal-ai/client
      const result = await fal.subscribe("fal-ai/flux/dev", {
        input: {
          prompt,
          image_size: "landscape_4_3",
        },
        logs: true, // щоб бачити логи запиту
      });

      if (!result.data || !result.data[0]?.url) {
        throw new Error("No image returned from Fal.ai");
      }


      // Беремо перший результат і конвертуємо в Buffer
      const imageUrl = result.data[0].url;
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);

      if (!imageRes.ok) throw new Error("Failed to fetch generated image");

      console.log("STEP 1: session ok");
      console.log("STEP 2: user", user.id);
      console.log("STEP 3: called Fal.ai");
      console.log("STEP 4: got image");
      console.log("STEP 5: uploaded to R2");

    } catch (err: any) {
      console.error("Fal.ai Error:", err);
      return NextResponse.json(
        { error: err.message || "AI generation failed" },
        { status: 503 }
      );
    }

    /* ================= R2 UPLOAD ================= */
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

    /* ================= DB WRITE ================= */
    const image = await prisma.image.create({
      data: {
        userId: user.id,
        prompt,
        imageUrl: finalImageUrl,
      },
    });

    return NextResponse.json({ image });

  } catch (error) {
    console.error("GENERATE ROUTE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

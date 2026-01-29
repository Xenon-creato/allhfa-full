import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import * as fal from "@fal-ai/serverless-client"; // Імпортуємо Fal

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
      // Виклик моделі Flux Dev (або будь-якої іншої на fal)
    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          image_size: "landscape_4_3",
        }),
      });

      // Обробка помилок авторизації або балансу (401)
      if (response.status === 401) {
        console.error("FAL_KEY is invalid or balance is empty (401).");
        return NextResponse.json(
          { error: "The site is currently not working. Please come back later." },
          { status: 503 } // Повертаємо 503 (Service Unavailable)
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Fal API failed");
      }
      console.log("STEP 1: session ok");
      console.log("STEP 2: user", user.id);
      console.log("STEP 3: calling FAL");
      console.log("STEP 4: got image");
      console.log("STEP 5: uploaded to R2");

      const result = await response.json();
      const imageUrl = result.images[0].url;

      // Завантаження картинки
      const imageRes = await fetch(imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);


      // Завантажуємо зображення з сервера Fal, щоб перетворити в Buffer для R2

      if (!imageRes.ok) throw new Error("Failed to fetch generated image");
      
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
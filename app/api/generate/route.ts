import { NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    const result = await fal.subscribe("fal-ai/stable-diffusion-xl", {
      input: {
        prompt,
        image_size: "square",
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }) as any;

    const imageUrl = result?.data?.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

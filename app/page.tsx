"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: session } = useSession();

  // ✅ FIX 1: initialize age gate from localStorage

  const bannedWords = [
    "child",
    "kid",
    "minor",
    "underage",
    "loli",
    "teen",
    "rape",
    "incest",
    "bestiality",
    "celeberty",
  ];

  const presets = [
    {
      label: "Anime Girl",
      prompt: "anime girl, detailed, high quality, 18+, safe, studio lighting",
    },
    {
      label: "Cyberpunk",
      prompt:
        "cyberpunk anime girl, neon lights, futuristic city, 18+, ultra detailed",
    },
    {
      label: "Fantasy",
      prompt:
        "fantasy anime girl, magic, cinematic lighting, 18+, detailed illustration",
    },
    {
      label: "Realistic",
      prompt:
        "realistic portrait of an adult woman, 18+, ultra realistic, high detail",
    },
    {
      label: "Hentai",
      prompt: "Create an image from popular Hentai in erotic pose, 18+",
    },
  ];

  
  const buy = async (packageId: string) => {
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  const generateImage = async () => {
    if (!session) {
      setError("You must be logged in to generate images.");
      return;
    }

    if (!prompt.trim() || loading) return;

    const lowerPrompt = prompt.toLowerCase();
    if (bannedWords.some((word) => lowerPrompt.includes(word))) {
      setError("This prompt violates our content policy.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl(null);

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      credentials: "include", // 🔥 КРИТИЧНО ВАЖЛИВО
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Image generation failed");
    }

    if (!data?.imageUrl) {
      throw new Error("Image was not generated");
    }

    setImageUrl(data.imageUrl);
  } catch (err: any) {
    console.error("Generate error:", err);
    setError(err?.message || "Generation failed");
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          AI Image Generator
        </h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          placeholder="Describe the image you want..."
          className="w-full p-4 rounded-lg bg-zinc-900 border border-zinc-700 mb-4"
          rows={4}
        />

        <p className="text-zinc-500 text-xs mb-3 text-center">
          All generated characters must be 18+. Illegal content is not allowed.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setPrompt(preset.prompt);
                setError("");
              }}
              className="px-3 py-1 text-sm rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {!session && (
          <button
            onClick={() => signIn("google")}
            className="w-full mb-4 px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition"
          >
            Sign in to generate images
          </button>
        )}

        {/* ✅ FIX 3: text moved OUTSIDE button */}
        <p className="text-zinc-500 text-xs text-center mb-2">
          Quick styles — click to auto-fill prompt
        </p>

        <button
          onClick={generateImage}
          disabled={!session || loading}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? "bg-zinc-600 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}

        <div className="mt-8 w-full h-[420px] border border-zinc-700 rounded-xl flex items-center justify-center bg-zinc-900">
          {!loading && imageUrl && (
            <img
              src={imageUrl}
              alt="Generated"
              onLoad={async () => {
                // ✅ картинка реально завантажилась
                await fetch("/api/generate/confirm", {
                  method: "POST",
                });
              }}
              onError={() => {
                // ❌ користувач НЕ бачить картинку
                alert("Сайт наразі не працює. Спробуйте пізніше.");
              }}
            />
          )}
          {!loading && !imageUrl && (
            <p className="text-zinc-600 text-sm">
              Your generated image will appear here
            </p>
          )}
        </div>
        <div className="mt-6 text-center text-sm text-zinc-500">
          We suggest that you formulate your request as precisely as possible 
          so that the image turns out as clear as possible. This is just our suggestion.
        </div>
      </div>
    </main>
  );
}

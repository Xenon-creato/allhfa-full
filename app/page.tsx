"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bannedWords = [
    "child",
    "kid",
    "minor",
    "underage",
    "loli",
    "rape",
    "incest",
    "bestiality",
    "celebrity",
  ];

  const presets = [
    {
      label: "Anime Portrait",
      prompt: "anime style portrait of an adult woman, 18+, high quality, soft lighting",
    },
    {
      label: "Cyberpunk",
      prompt: "cyberpunk anime woman, neon lights, futuristic city, ultra detailed, 18+",
    },
    {
      label: "Fantasy",
      prompt: "fantasy adult woman, magical atmosphere, cinematic lighting, 18+",
    },
    {
      label: "Realistic",
      prompt: "realistic portrait of an adult woman, 18+, ultra realistic, studio lighting",
    },
  ];

  const generateImage = async () => {
    if (!session) {
      setError("Please sign in to generate images.");
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const imageUrl = data?.image?.imageUrl;
      if (!res.ok || !imageUrl) {
        throw new Error(data?.error || "Generation failed");
      }

      setImageUrl(imageUrl);
    } catch (err: any) {
      setError(err?.message || "Generation error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        {/* HERO */}
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-zinc-800 text-xs text-zinc-300">
          AI Image Generator • 18+ Only
        </span>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Create stunning AI images
        </h1>

        <p className="text-zinc-400 max-w-xl mx-auto mb-10">
          Generate high-quality AI images in seconds.  
          One generation = one credit. No subscriptions.
        </p>
        {/* INPUT + GENERATE (stacked, full width) */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-7 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_80px_rgba(0,0,0,0.6)]">
          {/* PROMPT (full width) */}
          <div className="text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base md:text-lg font-semibold text-zinc-100">Prompt</div>
                <div className="mt-1 text-sm md:text-base text-zinc-400">
                  Be specific: style, lighting, pose, background, mood.
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/40 px-4 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  18+ only
                </span>
              </div>
            </div>

            <div className="mt-5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                placeholder='Describe the image you want… (style, character, background, lighting)'
                rows={6}
                className="w-full resize-none rounded-2xl bg-black/60 p-5 md:p-6 text-base md:text-lg text-zinc-100 placeholder:text-zinc-600
                          border border-zinc-800 focus:outline-none focus:border-red-600/70
                          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
              />

              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-500">
                <span>{prompt.trim().length}/500</span>

                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    setError("");
                  }}
                  disabled={loading || !prompt}
                  className="rounded-full border border-zinc-800 bg-black/40 px-4 py-2 hover:bg-zinc-900 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold text-zinc-300">Quick styles</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPrompt(p.prompt);
                      setError("");
                    }}
                    disabled={loading}
                    className="rounded-full border border-zinc-800 bg-black/40 px-4 py-2 text-sm md:text-base text-zinc-200
                              hover:bg-zinc-900 hover:border-zinc-700 transition disabled:opacity-50"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GENERATE (full width, moved under) */}
          <div className="mt-7 rounded-2xl border border-zinc-800 bg-black/40 p-6 md:p-7 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base md:text-lg font-semibold text-zinc-100">Generate</div>
                <div className="mt-1 text-sm md:text-base text-zinc-400">
                  One generation = <span className="text-zinc-100 font-semibold">1 credit</span>
                </div>
              </div>

              <div className="rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400">
                Secure checkout
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm md:text-base text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg">✓</span> Adult content only (18+)
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg">✓</span> Illegal content is not allowed
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg">✓</span> Better prompts → better results
              </div>
            </div>

            {!session && (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 text-base md:text-lg font-semibold text-white hover:bg-blue-700 transition"
              >
                Sign in to generate
              </button>
            )}

            <button
              type="button"
              onClick={generateImage}
              disabled={!session || loading || !prompt.trim()}
              className={[
                "mt-6 w-full rounded-2xl px-5 py-4 text-base md:text-lg font-semibold transition",
                loading ? "bg-zinc-700 text-white cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700",
                (!session || !prompt.trim()) ? "opacity-60 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {loading ? "Generating…" : "Generate Image"}
            </button>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm md:text-base text-red-200">
                {error}
              </div>
            )}

            <div className="mt-5 text-sm text-zinc-500">
              Tip: add “camera”, “lighting”, “background”, “mood”, “style”.
            </div>
          </div>
        </div>

        {/* RESULT */}
        <div className="mt-10 h-[420px] rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated"
              className="max-h-full rounded-xl"
              onLoad={() => {
                fetch("/api/generate/confirm", { method: "POST" });
              }}
              onError={() => {
                setError("Failed to load image.");
              }}
            />
          ) : (
            <p className="text-zinc-600 text-sm">
              Your generated image will appear here
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Tip: the more detailed your prompt, the better the result.
        </p>
      </div>
    </main>
  );
}

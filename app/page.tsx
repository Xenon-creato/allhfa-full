"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isAdult, setIsAdult] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MAX_GENERATIONS = 5;
  const [generationsLeft, setGenerationsLeft] = useState<number | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // ---- AGE CHECK ----
  useEffect(() => {
    const stored = localStorage.getItem("isAdult");
    if (stored === "true") {
      setIsAdult(true);
    } else {
      setIsAdult(false);
    }
    const storedGenerations = localStorage.getItem("generationsLeft");
    if (storedGenerations) {
      setGenerationsLeft(Number(storedGenerations));
    } else {
      localStorage.setItem("generationsLeft", String(MAX_GENERATIONS));
      setGenerationsLeft(MAX_GENERATIONS);
    }

  }, []);

  const confirmAge = () => {
    localStorage.setItem("isAdult", "true");
    setIsAdult(true);
  };

  const leaveSite = () => {
    window.location.href = "https://www.google.com";
  };

  // ---- GENERATION ----
  const generateImage = async () => {
    if (!isUnlocked && generationsLeft !== null && generationsLeft <= 0) {
      setError("Free limit reached. Unlock unlimited access.");
      return;
    }

    setCanRetry(false);
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log("API response:", res.status, data);
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Service unavailable. Please try later.");
        }

        if (res.status === 429) {
          throw new Error("Generation limit reached.");
        }

        throw new Error(
        data?.message ||
        data?.error?.message ||
        data?.error ||
        "Image generation failed"
      );

      }

      if (!data.imageUrl) {
        throw new Error("Image was not generated");
      }

      setImageUrl(data.imageUrl);

      if (generationsLeft !== null) {
        const newValue = generationsLeft - 1;
        setGenerationsLeft(newValue);
        localStorage.setItem("generationsLeft", String(newValue));
      }

    }
      catch (err: any) {
        setError(err?.message || "Generation failed");
        setCanRetry(true);
      }
      finally {
        setLoading(false);
      }
};


  // ---- LOADING STATE WHILE CHECKING AGE ----
  if (isAdult === null) return null;

  // ---- AGE GATE ----
  if (!isAdult) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md text-center p-8 border border-zinc-800 rounded-xl">
          <h1 className="text-2xl font-bold mb-4">18+ Warning</h1>
          <p className="text-zinc-400 mb-6">
            This website contains adult content.
            <br />
            You must be at least 18 years old to continue.
          </p>

          <button
            onClick={confirmAge}
            className="w-full px-6 py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            I am 18 or older
          </button>

          <button
            onClick={leaveSite}
            className="w-full mt-4 px-6 py-3 bg-zinc-700 rounded-lg font-semibold hover:bg-zinc-600 transition"
          >
            Leave / Return
          </button>
        </div>
      </main>
    );
  }

  // ---- MAIN APP ----
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          AI Image Generator
        </h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want..."
          className="w-full p-4 rounded-lg bg-zinc-900 border border-zinc-700 mb-4"
          rows={4}
        />

        <button
          onClick={generateImage}
          disabled={loading || (!isUnlocked && generationsLeft === 0)}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition
            ${
              loading
                ? "bg-zinc-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }
          `}
        >
        {generationsLeft !== null && (
          <p className="text-zinc-400 mt-2 text-sm text-center">
            Free generations left: {generationsLeft}
          </p>
        )}
        {generationsLeft === 0 && (
          <p className="text-red-500 mt-2 text-sm text-center">
            Free limit reached. Upgrade to continue.
          </p>
        )}
        {generationsLeft === 0 && !isUnlocked && (
        <button
          onClick={() => {
            setIsUnlocked(true);
            setError("");
          }}
          className="mt-3 w-full px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Unlock unlimited (demo)
        </button>
        )}

          {loading ? "Generating..." : "Generate Image"}
        </button>
        {error && (
          <p className="text-red-500 mt-4 text-sm text-center">{error}</p>
        )}
        {canRetry && (
          <button
            onClick={generateImage}
            className="mt-3 w-full px-6 py-2 bg-zinc-700 rounded-lg text-sm hover:bg-zinc-600 transition"
          >
            Retry
          </button>
        )}
        {isUnlocked && (
          <p className="text-green-500 mt-2 text-sm text-center">
            Unlimited access unlocked
          </p>
        )}

        {loading && (
          <p className="text-zinc-400 mt-4 text-center animate-pulse">
            AI is generating your image...
          </p>
        )}

        <div className="mt-8 w-full h-[420px] border border-zinc-700 rounded-xl flex items-center justify-center bg-zinc-900">
          {loading && (
            <p className="text-zinc-400 animate-pulse">
              Generating image...
            </p>
          )}

          {!loading && imageUrl && (
            <img
              src={imageUrl}
              alt="Generated"
              className="max-h-full max-w-full rounded-lg"
            />
          )}

          {!loading && !imageUrl && (
            <p className="text-zinc-600 text-sm">
              Your generated image will appear here
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

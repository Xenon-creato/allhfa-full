"use client";

import { useState } from "react";

export default function GeneratorUI() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setImageUrl(null);

    try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (res.status === 402) {
      setError("You are out of credits. Please upgrade.");
      return;
    }

    if (res.status === 401) {
      setError("Please sign in to generate images");
      return;
    }
    
      const data = await res.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h2 className="text-3xl font-bold text-center">
        Anime AI Image Generator
      </h2>

      {/* PROMPT */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your anime image..."
        className="w-full resize-none rounded-lg bg-zinc-900 p-4 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-red-500"
        rows={4}
      />

      {/* BUTTON */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full rounded-lg bg-red-600 py-3 font-semibold transition hover:bg-red-700 disabled:opacity-50"
      >
        {isGenerating ? "Generating..." : "Generate Image"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="text-center text-sm text-red-400">
          {error}
        </p>
      )}

      {/* RESULT */}
      <div className="flex justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated"
            className="rounded-xl shadow-lg"
          />
        ) : (
          <div className="flex h-[512px] w-[512px] items-center justify-center rounded-xl border border-zinc-700 text-zinc-500">
            Image will appear here
          </div>
        )}
      </div>
    </div>
  );
}
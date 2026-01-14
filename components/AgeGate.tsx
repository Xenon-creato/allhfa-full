"use client";

import { useState } from "react";

type AgeGateProps = {
  onAccept: () => void;
};

export default function AgeGate({ onAccept }: AgeGateProps) {
  const [error, setError] = useState(false);

  const handleAccept = () => {
    onAccept();
  };

  const handleReject = () => {
    setError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
      <div className="max-w-md w-full mx-4 rounded-xl bg-zinc-900 p-6 text-center shadow-xl">
        <h1 className="mb-4 text-3xl font-bold text-red-500">
          18+ Content Warning
        </h1>

        <p className="mb-6 text-sm text-zinc-300">
          This website contains AI-generated adult (18+) anime-style content.
          By entering, you confirm that you are at least 18 years old and that
          viewing such material is legal in your country.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-400">
            You must be 18 or older to access this site.
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-red-600 py-2 font-semibold transition hover:bg-red-700"
          >
            I am 18+
          </button>

          <button
            onClick={handleReject}
            className="flex-1 rounded-lg border border-zinc-600 py-2 font-semibold text-zinc-300 transition hover:bg-zinc-800"
          >
            Leave
          </button>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          By continuing, you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

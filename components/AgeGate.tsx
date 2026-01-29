"use client";

import { useState } from "react";
import Link from "next/link";

type AgeGateProps = {
  onAccept: () => void;
};

export default function AgeGate({ onAccept }: AgeGateProps) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(false);

  const handleAccept = () => {
    if (!agreed) {
      setError(true);
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h1 className="text-3xl font-bold text-red-500 mb-4 text-center">
          18+ Content Warning
        </h1>

        <p className="text-sm text-zinc-300 mb-6 text-center">
          This website contains AI-generated adult (18+) anime-style content.
          You must be at least 18 years old and comply with local laws.
        </p>

        {/* CHECKBOX */}
        <label className="flex items-start gap-3 text-sm text-zinc-300 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setError(false);
            }}
            className="mt-1 accent-red-600"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="text-xs text-red-400 mb-3">
            You must accept the Terms and Privacy Policy to continue.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className={`flex-1 rounded-lg py-2 font-semibold transition ${
              agreed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-zinc-700 cursor-not-allowed"
            }`}
          >
            I am 18+
          </button>

          <a
            href="https://www.google.com"
            className="flex-1 rounded-lg border border-zinc-700 py-2 text-center font-semibold text-zinc-300 hover:bg-zinc-800 transition"
          >
            Leave
          </a>
        </div>
      </div>
    </div>
  );
}

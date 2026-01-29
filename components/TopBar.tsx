"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import CreditsBadge from "@/components/CreditsBadge";

export default function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b border-zinc-800 bg-black">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-white">
            AI Anime Gen
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-400">
            {session && (
              <Link
                href="/gallery"
                className="hover:text-white transition"
              >
                Gallery
              </Link>
            )}

            <Link href="/about" className="hover:text-white transition">
              About
            </Link>

            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>

            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/refund" className="hover:text-white transition">
              Refund
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <CreditsBadge />

              <Link
                href="/pricing"
                className="text-base font-semibold text-zinc-300 hover:text-white transition"
              >
                Buy credits
              </Link>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

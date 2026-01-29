"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CreditsBadge() {
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits));
  }, []);

  if (credits === null) return null;

  return (
    <Link
      href="/pricing"
      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-700 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-00 transition"
    >
      💎 {credits} credits
    </Link>
  );
}

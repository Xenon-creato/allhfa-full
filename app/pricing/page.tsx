"use client";

import { useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";

type PackageId = "starter_10" | "basic_15" | "pro_25" | "ultimate_35";

const PACKAGES: Array<{
  id: PackageId;
  title: string;
  price: number;
  credits: number;
  desc: string;
  popular?: boolean;
}> = [
  { id: "starter_10", title: "Starter", price: 10.5, credits: 80, desc: "Try the service" },
  { id: "basic_15", title: "Basic", price: 15, credits: 160, desc: "For regular users", popular: true },
  { id: "pro_25", title: "Pro", price: 25, credits: 400, desc: "Best value" },
  { id: "ultimate_35", title: "Ultimate", price: 35, credits: 900, desc: "For heavy users" },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingId, setLoadingId] = useState<PackageId | null>(null);
  const [error, setError] = useState<string>("");

  const isAuthed = !!session?.user?.email;

  const popular = useMemo(() => PACKAGES.find((p) => p.popular)?.id ?? "basic_15", []);

  const buy = async (packageId: PackageId) => {
    setError("");

    if (!isAuthed) {
      // краще UX, ніж alert
      await signIn();
      return;
    }

    try {
      setLoadingId(packageId);

      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.invoiceUrl) {
        setError(data?.error || "Payment error. Please try again.");
        setLoadingId(null);
        return;
      }

      window.location.href = data.invoiceUrl;
    } catch (e) {
      console.error("BUY ERROR:", e);
      setError("Network error. Please try again.");
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] mx-auto h-[280px] max-w-5xl blur-3xl opacity-30"
           style={{ background: "radial-gradient(closest-side, rgba(59,130,246,.45), transparent)" }} />

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            One-time credits · No subscriptions
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Buy credits
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Pay with <span className="text-zinc-200">card</span> or <span className="text-zinc-200">crypto</span> via a secure checkout.
            Credits are added automatically after successful payment.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-zinc-400">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2">
              <span className="text-zinc-200">1 generation</span> = 1 credit
            </div>

            {status === "loading" ? (
              <span className="text-zinc-500">Checking login…</span>
            ) : isAuthed ? (
              <span className="text-zinc-500">Logged in as {session?.user?.email}</span>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-zinc-200 underline underline-offset-4 hover:text-white"
              >
                Sign in to purchase
              </button>
            )}
          </div>

          {error ? (
            <div className="mt-6 w-full max-w-2xl rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-left text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        {/* packages */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => {
            const isPopular = p.id === popular || p.popular;
            const isLoading = loadingId === p.id;

            return (
              <div
                key={p.id}
                className={[
                  "relative rounded-2xl border bg-zinc-950/60 p-5 shadow-sm",
                  isPopular ? "border-zinc-700 ring-1 ring-zinc-700" : "border-zinc-800",
                ].join(" ")}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="mt-1 text-sm text-zinc-400">{p.desc}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-3xl font-bold">${p.price}</div>
                  <div className="mt-1 text-sm text-zinc-400">
                    <span className="text-zinc-200">💎 {p.credits}</span> credits
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Instant access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Card or crypto
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> Credits auto-added
                  </li>
                </ul>

                <button
                  disabled={!isAuthed || isLoading}
                  onClick={() => buy(p.id)}
                  className={[
                    "mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
                    isPopular
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-800 text-white hover:bg-zinc-700",
                    (!isAuthed || isLoading) ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {isLoading ? "Redirecting…" : isAuthed ? "Pay with card / crypto" : "Sign in to buy"}
                </button>

                <p className="mt-3 text-xs text-zinc-500">
                  You’ll be redirected to a secure checkout.
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-zinc-500">
          By purchasing, you agree to our Terms and Refund policy.
        </div>
      </div>
    </main>
  );
}

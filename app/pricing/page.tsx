"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PACKAGES = [
  { id: "starter_10", title: "Starter", price: 10.5, credits: 80, desc: "Try the service" },
  { id: "basic_15", title: "Basic", price: 15, credits: 160, desc: "For regular users", popular: true },
  { id: "pro_25", title: "Pro", price: 25, credits: 400, desc: "Best value" },
  { id: "ultimate_35", title: "Ultimate", price: 35, credits: 900, desc: "For heavy users" },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();


  // Crypto payment
  const buyWithCrypto = async (packageId: string) => {
    if (!session) return alert("Please log in first");

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (!res.ok || !data.invoiceUrl) {
        alert("Payment error, try again later");
        return;
      }

      window.location.href = data.invoiceUrl;
    } catch (err) {
      console.error("Crypto BUY ERROR:", err);
      alert("Network error");
    }
  };
  const buyWithCard = async (packageId: string) => {
    if (!session) return alert("Please log in first");

    try {
      const res = await fetch("/api/checkout/lemonsqueezy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert("Payment error, try again later");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("LemonSqueezy BUY ERROR:", err);
      alert("Network error");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-3">Buy Credits</h1>
        <p className="text-zinc-400 text-center">Pay only for what you use. No subscriptions.</p>
        <p className="text-zinc-400 text-center">Credits can be used to generate AI images. One generation costs 1 credits.</p>
        <div className="space-y-4 mt-10">
          {PACKAGES.map((p) => (
            <div
              key={p.id}
              className={`rounded-full border px-6 py-4 ${
                p.popular ? "bg-zinc-800 border-zinc-700" : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                {/* LEFT */}
                <div>
                  {p.popular && <span className="text-xs text-red-500 font-semibold">MOST POPULAR</span>}
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-zinc-400">{p.desc}</div>
                </div>

                {/* CENTER */}
                <div className="text-center">
                  <div className="text-3xl font-bold">${p.price}</div>
                  <div className="text-sm text-zinc-400">💎 {p.credits} credits</div>
                </div>

                {/* RIGHT */}
                <div className="flex gap-2">
                  <button
                    disabled={!session}
                    onClick={() => buyWithCard(p.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      p.popular ? "bg-red-600 hover:bg-red-700" : "bg-zinc-700 hover:bg-zinc-600"
                    } disabled:opacity-50`}
                  >
                    Buy (Card)
                  </button>

                  <button
                    disabled={!session}
                    onClick={() => buyWithCrypto(p.id)}
                    className="px-4 py-2 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Buy (Crypto)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
export const dynamic = "force-dynamic";

const PACKAGES = [ { id: "starter_10", title: "Starter", price: 10.5, credits: 80, desc: "Try the service", }, { id: "basic_15", title: "Basic", price: 15, credits: 160, desc: "For regular users", popular: true, }, { id: "pro_25", title: "Pro", price: 25, credits: 400, desc: "Best value", }, { id: "ultimate_35", title: "Ultimate", price: 35, credits: 900, desc: "For heavy users", }, ];
export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // BUY Crypto (NOWPayments)
  const buyCrypto = async (packageId: string) => {
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();
      if (!res.ok || !data.invoiceUrl) {
        alert("Crypto payment error, try again later");
        return;
      }

      window.location.href = data.invoiceUrl;
    } catch (err) {
      console.error("Crypto BUY ERROR:", err);
      alert("Network error");
    }
  };

  // BUY Card (Paddle)
  const buyCard = async (packageId: string, amount: number, currency: string) => {
    try {
      const res = await fetch("/api/payments/paddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, amount, currency, userId: session?.user?.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        alert("Card payment error, try again later");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Card BUY ERROR:", err);
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
              className={`rounded-xl border px-6 py-4
                ${p.popular ? "bg-zinc-800 border-zinc-700" : "bg-zinc-900 border-zinc-800"}
              `}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* LEFT */}
                <div>
                  {p.popular && (
                    <span className="text-xs text-red-500 font-semibold">MOST POPULAR</span>
                  )}
                  <div className="text-lg font-semibold">{p.title}</div>
                  <div className="text-sm text-zinc-400">{p.desc}</div>
                </div>

                {/* CENTER */}
                <div className="text-center my-2 md:my-0">
                  <div className="text-3xl font-bold">${p.price}</div>
                  <div className="text-sm text-zinc-400">💎 {p.credits} credits</div>
                </div>

                {/* RIGHT */}
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    disabled={!session}
                    onClick={() => buyCrypto(p.id)}
                    className="px-4 py-2 rounded-lg font-semibold bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Pay with Crypto
                  </button>
                  <button
                    disabled={!session}
                    onClick={() => buyCard(p.id, p.price, "USD")}
                    className="px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    Pay with Card
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

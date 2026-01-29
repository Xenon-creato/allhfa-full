"use client";

export default function BuyCredits() {
  const buy = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <button
      onClick={buy}
      className="rounded-lg bg-green-600 px-6 py-3 font-bold hover:bg-green-700"
    >
      Buy 10 Credits — $5
    </button>
  );
}

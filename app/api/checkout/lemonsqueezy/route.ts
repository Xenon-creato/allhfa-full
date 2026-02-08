import { NextResponse } from "next/server";

const VARIANT_MAP: Record<string, number> = {
  starter_10: 1289856,
  basic_15: 1289860,
  pro_25: 1289861,
  ultimate_35: 1289862,
};

export async function POST(req: Request) {
  try {
    const { packageId } = await req.json();
    const variantId = VARIANT_MAP[packageId];

    if (!variantId) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const checkoutUrl = `https://allhfa.lemonsqueezy.com/checkout/buy/${variantId}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Lemon checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

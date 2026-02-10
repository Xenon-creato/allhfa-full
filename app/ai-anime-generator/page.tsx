import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";

// ✅ SEO Metadata (US/EU target, English)
export const metadata: Metadata = {
  title: "AI Anime Generator (18+) — Create Anime Art from Text",
  description:
    "Generate high-quality AI anime images from text prompts. Fast, private gallery, and flexible styles. 18+ only. Available for users in the US & EU.",
  alternates: {
    canonical: "/ai-anime-generator",
  },
  openGraph: {
    title: "AI Anime Generator (18+) — Create Anime Art from Text",
    description:
      "Create anime-style images from text prompts. Fast generation, private gallery, flexible styles. 18+ only.",
    url: "/ai-anime-generator",
    siteName: "ALLHFA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Anime Generator (18+) — Create Anime Art from Text",
    description:
      "Create anime-style images from text prompts. Fast generation, private gallery, flexible styles. 18+ only.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  keywords: [
    "ai anime generator",
    "anime ai generator",
    "text to anime",
    "anime art generator",
    "ai anime image generator",
    "anime generator online",
    "18+ ai image generator",
  ],
};

const FAQ = [
  {
    q: "What is an AI anime generator?",
    a: "An AI anime generator creates anime-style images from a text prompt. You describe a character, scene, outfit, lighting, and the model generates an image.",
  },
  {
    q: "Is it available in the US and EU?",
    a: "Yes — the product is designed for users in the US and EU. Availability can depend on local rules and payment methods.",
  },
  {
    q: "Do you store my prompts or images publicly?",
    a: "Your gallery is private — only you can see your generated images when you’re logged in.",
  },
  {
    q: "Can I generate NSFW content?",
    a: "This page is for 18+ users only. Illegal content is not allowed. You are responsible for the prompts you enter.",
  },
  {
    q: "How do credits work?",
    a: "You generate images using credits. Choose a package that fits your usage, then spend credits per generation.",
  },
];

function jsonLdWebsite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ALLHFA",
    url: "https://www.allhfa.com/ai-anime-generator",
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.allhfa.com/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

function jsonLdFaq() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

export default function AiAnimeGeneratorPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq()) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-zinc-400" />
          US & EU • 18+ only • Private gallery
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
          AI Anime Generator (18+)
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-300">
          Create anime-style images from a text prompt — characters, scenes, outfits,
          lighting and more. Fast generation, clean UI, and your gallery stays private.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-90"
          >
            Start generating
          </Link>

          <Link
            href="/pricing"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            View pricing
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          All generated characters must be 18+. Illegal content is not allowed.
        </p>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-base font-semibold">High-quality anime styles</h2>
            <p className="mt-2 text-sm text-zinc-300">
              From clean cel shading to cinematic anime looks — describe what you want and iterate fast.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-base font-semibold">Private user gallery</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Your generations are visible only to you when logged in.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-base font-semibold">Credits-based generation</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Pick a package, get credits, generate anytime. Great for both casual and power users.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            <li className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-sm font-semibold">1) Write a prompt</p>
              <p className="mt-2 text-sm text-zinc-300">
                Describe character, pose, outfit, background, lighting, and style.
              </p>
            </li>
            <li className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-sm font-semibold">2) Generate</p>
              <p className="mt-2 text-sm text-zinc-300">
                One click — your credits are used per generation.
              </p>
            </li>
            <li className="rounded-xl border border-zinc-800 bg-black/40 p-4">
              <p className="text-sm font-semibold">3) Save to your gallery</p>
              <p className="mt-2 text-sm text-zinc-300">
                Keep results organized in a private gallery linked to your account.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="text-xl font-semibold">FAQ</h2>

        <div className="mt-4 grid gap-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold">
                {item.q}
              </summary>
              <p className="mt-3 text-sm text-zinc-300">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:opacity-90"
          >
            Generate now
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            Get credits
          </Link>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Note: This SEO page is written in English for US/EU search intent. If you use i18n later,
          we can add locale alternates and localized variants.
        </p>
      </section>
    </main>
  );
}

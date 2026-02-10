"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CreditsBadge from "@/components/CreditsBadge";

type NavItem = { href: string; label: string; requiresAuth?: boolean };

export default function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { href: "/gallery", label: "Gallery", requiresAuth: true },
      { href: "/about", label: "About" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/refund", label: "Refund" },
    ],
    []
  );

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg sm:text-xl font-bold text-white">
            Allhfa ai
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navItems
              .filter((i) => !i.requiresAuth || !!session)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "px-3 py-2 rounded-full transition",
                    isActive(item.href)
                      ? "text-white bg-white/10 border border-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <CreditsBadge />

              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
                           bg-red-600 text-white hover:bg-red-700 transition shadow-[0_10px_30px_rgba(220,38,38,0.25)]"
              >
                Buy credits
              </Link>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="hidden sm:inline-flex px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition"
            >
              Sign in
            </button>
          )}

          {/* MOBILE: CTA + BURGER */}
          <div className="flex md:hidden items-center gap-2">
            {session ? (
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold
                           bg-red-600 text-white hover:bg-red-700 transition"
              >
                Buy
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="inline-flex px-3 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition"
              >
                Sign in
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-black/40 px-3 py-2 text-zinc-200 hover:bg-zinc-900 transition"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAV DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-1">
            {navItems
              .filter((i) => !i.requiresAuth || !!session)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "px-3 py-2 rounded-xl transition",
                    isActive(item.href)
                      ? "text-white bg-white/10 border border-white/10"
                      : "text-zinc-300 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}

            {session && (
              <Link
                href="/pricing"
                className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold
                           bg-red-600 text-white hover:bg-red-700 transition"
              >
                Buy credits
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

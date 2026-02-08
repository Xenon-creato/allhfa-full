import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
export const metadata = {
  title: "Create wheatever you want, with our allhfa.ai Generator",
  description:
    "Create AI images with no border. No filters, no censorship. Fast, private, unlimited AI image generation.",
  keywords: [
    "ai image generator",
    "create ai image no limitation",
    "uncensored ai image",
    "ai hentai generator",
    "create you`r own hentai",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

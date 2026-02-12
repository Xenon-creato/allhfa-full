import "./globals.css";
import Providers from "./providers";
import AppShell from "@/components/AppShell";
export const metadata = {
  title: "Allhfa.ai — AI Image Generator",
  description:
    "Generate AI images from text in seconds. Private gallery, fast results, and safe use. 18+ only.",
  keywords: [
    "ai image generator",
    "text to image",
    "ai art generator",
    "private gallery",
    "image generation",
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

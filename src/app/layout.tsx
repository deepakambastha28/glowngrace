import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/layout/topbar";
import { Navbar } from "@/components/layout/navbar";
import { FooterGate } from "@/components/layout/footer-gate";
import { CartSync } from "@/components/layout/cart-sync";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Glow & Grace — Cosmetics & Beauty Careers | Lucknow",
    template: "%s | Glow & Grace",
  },
  description:
    "Lucknow's premium destination for women's cosmetics and beauty career placement. Shop makeup, skincare, nail care & fragrances, or launch your beauty career.",
  keywords: [
    "Lucknow cosmetics",
    "beauty products",
    "women cosmetics store",
    "beauty parlour jobs",
    "makeup Lucknow",
    "skincare",
    "beauty career",
  ],
  openGraph: {
    title: "Glow & Grace — Cosmetics & Beauty Careers | Lucknow",
    description:
      "Premium women's cosmetics store with beauty-parlour job placement in Lucknow.",
    type: "website",
    locale: "en_IN",
    siteName: "Glow & Grace",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#d6336c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} bg-cream text-charcoal font-body min-h-screen flex flex-col`}
      >
        <CartSync />
        <TopBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <FooterGate />
        <Toaster />
      </body>
    </html>
  );
}
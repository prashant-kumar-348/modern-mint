import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

// Trajan-style serif for the emerald "MODERN MINT" wordmark (matches Figma)
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Modern Mint — Strategy Awaits",
  description:
    "High Interaction Simulation of Leadership, Negotiation & Psychology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${cinzel.variable}`}>
      <body className="h-full">{children}</body>
    </html>
  );
}

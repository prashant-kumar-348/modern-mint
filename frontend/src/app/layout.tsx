import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(event) {
                if (event.filename && (event.filename.indexOf('chrome-extension') !== -1 || event.filename.indexOf('inpage.js') !== -1)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
              window.addEventListener('unhandledrejection', function(event) {
                var reason = event.reason;
                if (reason && reason.stack && (reason.stack.indexOf('chrome-extension') !== -1 || reason.stack.indexOf('inpage.js') !== -1)) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}

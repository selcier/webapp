import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://arcter.xyz";
const TITLE = "Arcter | The full cost of a tokenized stock, on Solana";
const DESCRIPTION =
  "Arcter is a self-custodial exchange for tokenized stocks on Solana. Each ticket splits the price into mid, spread, skew and fee, and trades settle in USDC. US persons cannot use it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Arcter",
  },
  description: DESCRIPTION,
  applicationName: "Arcter",
  keywords: [
    "Arcter",
    "Solana",
    "tokenized stocks",
    "xStocks",
    "Ondo Global Markets",
    "USDC",
    "equity tokens",
    "self-custodial exchange",
  ],
  authors: [{ name: "Arcter", url: SITE_URL }],
  creator: "Arcter",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Arcter",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@arcterdotxyz",
    creator: "@arcterdotxyz",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-arc-canvas text-arc-ink antialiased">{children}</body>
    </html>
  );
}

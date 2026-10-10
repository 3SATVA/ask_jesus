import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

function metadataBase() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:43123");
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: "ASK JESUS",
  description:
    "Ask a question and receive a warm answer in the voice of Jesus, drawn from the four Gospels.",
  openGraph: {
    title: "ASK JESUS",
    description:
      "A quiet place to ask, with answers inspired by Matthew, Mark, Luke, and John.",
    images: [
      {
        url: "/jesus.jpg",
        width: 720,
        height: 1280,
        alt: "An original illustration of Jesus, arms open, with a golden light at his heart.",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#07090f] text-[#f6efe2]">{children}</body>
    </html>
  );
}

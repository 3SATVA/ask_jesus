import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-outfit",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cinzel-face",
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
        url: "/art/jesus-og.jpg",
        width: 1200,
        height: 1338,
        alt: "Jesus with arms open, light shining through the clouds.",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${display.variable} ${cinzel.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/art/jesus-1280.avif"
          type="image/avif"
          imageSrcSet="/art/jesus-640.avif 640w, /art/jesus-960.avif 960w, /art/jesus-1280.avif 1280w, /art/jesus-1600.avif 1600w, /art/jesus-1952.avif 1952w"
          imageSizes="100vw"
        />
      </head>
      <body className="min-h-dvh bg-[#07080e] text-[#f6efe2]">{children}</body>
    </html>
  );
}

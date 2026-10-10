import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Outfit } from "next/font/google";
import { SHARE_IMAGE_PATH, siteUrl } from "@/lib/site";
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

const description =
  "Ask a question and receive a warm answer in the voice of Jesus, drawn from the four Gospels.";
const shareDescription =
  "A quiet place to ask, with answers inspired by Matthew, Mark, Luke, and John.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#07090f",
};

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "ASK JESUS",
  applicationName: "Ask Jesus AI",
  description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Ask Jesus",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "ASK JESUS",
    description: shareDescription,
    siteName: "Ask Jesus AI",
    type: "website",
    url: siteUrl(),
    images: [
      {
        url: SHARE_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Jesus with arms open, light shining through the clouds. ASK JESUS.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASK JESUS",
    description: shareDescription,
    images: [SHARE_IMAGE_PATH],
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
      <body className="bg-black text-[#f6efe2]">{children}</body>
    </html>
  );
}

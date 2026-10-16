import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    "/api/ask": ["./JESUS_PROMPT.md"],
    "/api/iap/verify": ["./certs/AppleRootCA-G2.cer", "./certs/AppleRootCA-G3.cer"],
  },
  serverExternalPackages: ["@apple/app-store-server-library"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

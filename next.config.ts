import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions are enabled by default in Next.js 14
  },
  // Disable image optimization for external URLs in MVP
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

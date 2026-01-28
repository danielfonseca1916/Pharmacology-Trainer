import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

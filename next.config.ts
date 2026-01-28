import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Fail build on ESLint errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

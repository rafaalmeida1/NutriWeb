import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Disable source maps in development to avoid warnings
  productionBrowserSourceMaps: false,
};

export default nextConfig;

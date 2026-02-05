import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/cc',
  images: {
    unoptimized: true
  }
};

export default nextConfig;

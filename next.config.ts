import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;

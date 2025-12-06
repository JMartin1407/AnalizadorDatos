import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo exportar estático en Azure, Vercel soporta dinámico
  ...(process.env.VERCEL ? {} : { output: 'export' }),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Optimizaciones para build más rápido
  compress: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;

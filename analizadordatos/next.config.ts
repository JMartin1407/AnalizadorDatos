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
  // Optimizaciones para build más rápido y archivos más pequeños
  compress: true,
  productionBrowserSourceMaps: false,
  // Reducir duplicación de código
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'chart.js', 'react-chartjs-2'],
  },
};

export default nextConfig;

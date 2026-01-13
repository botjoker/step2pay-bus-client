import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // Для работы с изображениями из внешних источников
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Настройка редиректов
  async redirects() {
    return [];
  },

  // Настройка rewrites для проксирования API запросов
  async rewrites() {
    return [];
  },
};

export default nextConfig;

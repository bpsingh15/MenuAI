/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/types': './types',
      '@/data': './data',
      '@/app': './app',
      '@/public': './public',
    };
    return config;
  },
};

module.exports = nextConfig;

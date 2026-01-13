/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  // Suppress headers() warnings in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Updated images configuration for Next.js 16
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add empty turbopack config to silence the warning
  turbopack: {},
};

module.exports = nextConfig;
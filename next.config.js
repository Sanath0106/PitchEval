const path = require('path');

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
  // Suppress specific warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    domains: ['images.clerk.dev']
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias.canvas = false;
    
    // Add explicit path aliases for better resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/app': path.resolve(__dirname, 'app'),
      'pdf-parse/test': false,
    };
    
    // Exclude problematic files from pdf-parse
    config.module.rules.push({
      test: /node_modules\/pdf-parse\/.*\.pdf$/,
      use: 'null-loader',
    });

    // Suppress headers() warnings in development
    if (dev) {
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('headers()') || message.includes('sync-dynamic-apis')) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('headers()') || message.includes('sync-dynamic-apis')) {
          return;
        }
        originalError.apply(console, args);
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;
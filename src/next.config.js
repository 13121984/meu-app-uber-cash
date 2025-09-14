
/** @type {import('next').NextConfig} */

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: './.env' });

const nextConfig = {
  // Recommended: disable built-in image optimization for static export
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

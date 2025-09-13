
/** @type {import('next').NextConfig} */

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: './.env' });

const nextConfig = {
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
        protocol: 'https://',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

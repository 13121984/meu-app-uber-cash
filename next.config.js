
/** @type {import('next').NextConfig} */

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: './.env' });

const nextConfig = {
  output: 'export',
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
  // Workaround for issues with fetch cache and static export
  fetchCache: 'only-no-store',
};

module.exports = nextConfig;

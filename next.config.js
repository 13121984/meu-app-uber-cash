/** @type {import('next').NextConfig} */

require('dotenv').config({ path: './.env' });

const nextConfig = {
  output: 'export', // Adiciona a configuração de export estático
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

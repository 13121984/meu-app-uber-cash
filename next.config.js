/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export', // Essencial para o Capacitor
  distDir: 'out', // Diretório de saída padrão para `export`
  images: {
    unoptimized: true, // Necessário para `next export`
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

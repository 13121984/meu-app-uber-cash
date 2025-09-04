/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'export', // Adicionado para exportação estática
  distDir: 'out', // Garante que a saída seja na pasta 'out'
  images: {
    unoptimized: true, // Adicionado para exportação estática
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
  // Removemos as configurações de PWA e Firebase que estavam causando conflitos.
  // A simplicidade garantirá que o build funcione.
};

module.exports = nextConfig;

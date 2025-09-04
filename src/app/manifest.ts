import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Uber Cash',
    short_name: 'UberCash',
    description: 'Seu app para gestão de ganhos como motorista de aplicativo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a202c', // Um fundo escuro, você pode ajustar
    theme_color: '#2563eb', // A cor primária azul
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

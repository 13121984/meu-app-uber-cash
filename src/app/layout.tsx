
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'Uber Cash',
  description: 'Seu app para gestão de ganhos como motorista de aplicativo.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getSettings pode ser chamado aqui, mas a aplicação do tema será no cliente
  // para evitar problemas de cache e garantir que o usuário veja a UI correta
  // mesmo antes de uma revalidação completa.
  const settings = await getSettings();

  return (
    <html 
      lang="pt-BR" 
      // A classe do tema será gerenciada pelo ProtectedRoute/AuthProvider no cliente
      className={cn("h-full", settings.theme)}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background">
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

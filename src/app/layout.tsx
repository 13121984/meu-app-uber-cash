
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { AppContent } from './app-content';


const APP_NAME = "Uber Cash";
const APP_DEFAULT_TITLE = "Uber Cash";
const APP_TITLE_TEMPLATE = "%s - Uber Cash";
const APP_DESCRIPTION = "Sua rota certa para o sucesso.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme can no longer be determined at build time as it's user-specific.
  // It will be applied dynamically on the client in AuthProvider/AppContent.
  
  return (
    <html 
      lang="pt-BR" 
      className="h-full" // Default to light mode, client will override
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="font-body antialiased h-full">
        <AuthProvider>
            <AppContent>
              {children}
            </AppContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { FloatingMenu } from '@/components/layout/floating-menu';


const APP_NAME = "Rota Certa";
const APP_DEFAULT_TITLE = "Rota Certa";
const APP_TITLE_TEMPLATE = "%s - Rota Certa";
const APP_DESCRIPTION = "Seu app para gestão de ganhos como motorista de aplicativo.";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html 
      lang="pt-BR" 
      className={cn("h-full", settings.theme === 'dark' ? 'dark' : '')}
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
      <body className="font-body antialiased h-full bg-background">
        <div className="relative flex min-h-screen w-full flex-col">
            <main className="flex-1 p-4 sm:pl-20 sm:py-6 md:p-8 md:pl-24">
                {children}
            </main>
            <FloatingMenu />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

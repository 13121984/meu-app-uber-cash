
'use client';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

// These should be fine at the top level
const APP_NAME = "Rota Certa";
const APP_DEFAULT_TITLE = "Rota Certa";
const APP_TITLE_TEMPLATE = "%s - Rota Certa";
const APP_DESCRIPTION = "Seu app para gestão de ganhos como motorista de aplicativo.";

// We cannot use `export const metadata: Metadata` in a client component,
// so we'll have to settle for this.
if (typeof window === "undefined") {
    // Ugly hack to set metadata in a client component
    // @ts-ignore
    (async () => {
        const {getSettings} = await import('@/services/settings.service');
        const settings = await getSettings();
        // @ts-ignore
        const head = document.querySelector('head');
        if(head) {
            head.innerHTML += `
            <meta name="application-name" content="${APP_NAME}" />
            <title>${APP_DEFAULT_TITLE}</title>
            <meta name="description" content="${APP_DESCRIPTION}" />
            <link rel="manifest" href="/manifest.webmanifest" />
            <meta name="apple-webapp-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="${APP_DEFAULT_TITLE}" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="theme-color" content="${settings.theme === 'dark' ? '#09090b' : '#ffffff'}" />
            `;
        }
    })();
}

function MobileHeader() {
  const { setOpenMobile } = useSidebar();
  return (
     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
        <Button 
          variant="ghost" 
          className="md:hidden"
          onClick={() => setOpenMobile(true)}
        >
          <Car className="h-12 w-12 text-primary mr-2" />
          <span className="font-semibold text-lg">Menu</span>
        </Button>
      </header>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Since this is a client component, we can't await server components here.
  // We will have to fetch settings on the client.
  // For the theme, we can apply it via a sub-component that runs a useEffect.
  // We will also apply it to the html tag to avoid a flash of the wrong theme.

  return (
    <html 
      lang="pt-BR" 
      className={cn("h-full", "dark")} // Default to dark and update on client
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
        <SidebarProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <Sidebar>
                <SidebarNav />
              </Sidebar>
              <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                 <MobileHeader />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
              </div>
            </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

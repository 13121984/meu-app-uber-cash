
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

function MobileHeader() {
  "use client"
  const { setOpenMobile } = useSidebar();
  return (
     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
        <Button 
          variant="ghost" 
          className="md:hidden"
          onClick={() => setOpenMobile(true)}
        >
          <Car className="h-12 w-12 text-primary mr-2" />
          <span className="font-semibold">Menu</span>
        </Button>
      </header>
  );
}

function AppBody({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  "use client";
  return (
      <body className="font-body antialiased h-full bg-background">
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
        <Toaster />
      </body>
  );
}

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
      <SidebarProvider>
        <AppBody>{children}</AppBody>
      </SidebarProvider>
    </html>
  );
}

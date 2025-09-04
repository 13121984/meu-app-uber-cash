
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

const APP_NAME = "Uber Cash";
const APP_DEFAULT_TITLE = "Uber Cash";
const APP_TITLE_TEMPLATE = "%s - Uber Cash";
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
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
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
      className={cn("h-full", settings.theme)}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background">
        <SidebarProvider>
            <div className="md:flex">
              <Sidebar>
                <SidebarNav />
              </Sidebar>
              <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
                  <SidebarTrigger />
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8">
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

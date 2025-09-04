import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from "@/components/ui/toaster";
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { getTextColorValue } from '@/lib/color-map';

export const metadata: Metadata = {
  title: 'Uber Cash',
  description: 'Seu app para gestão de ganhos como motorista de aplicativo.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const textColorValue = getTextColorValue(settings.textColor, settings.theme);

  const themeStyle = {
    '--theme-primary': settings.primaryColor,
    '--theme-background': settings.backgroundColor,
    '--theme-foreground': textColorValue.foreground,
    '--theme-card-foreground': textColorValue.cardForeground,
    '--theme-muted-foreground': textColorValue.mutedForeground,
    '--theme-primary-foreground': textColorValue.primaryForeground,
    '--theme-accent': settings.primaryColor, // Accent usa a mesma cor primária
  } as React.CSSProperties;

  return (
    <html 
      lang="pt-BR" 
      className={cn("h-full", settings.theme)}
      style={themeStyle}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
        <SidebarProvider>
          <Sidebar>
            <SidebarNav />
          </Sidebar>
          <SidebarInset>
              <main className="p-4 md:p-6 lg:p-8">
                <div className="md:hidden mb-4">
                  <SidebarTrigger />
                </div>
                {children}
              </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

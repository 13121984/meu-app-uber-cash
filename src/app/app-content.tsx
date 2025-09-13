
"use client";

import { useAuth } from '@/contexts/auth-context';
import { TopBar } from '@/components/layout/top-bar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { VehicleSetup } from '@/components/configuracoes/vehicle-setup';

export function AppContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [theme, setTheme] = useState('dark');
  const [colorTheme, setColorTheme] = useState('orange');
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  // This effect runs only on the client, after hydration.
  useEffect(() => {
    if (!loading && user) {
      // Apply themes based on user preferences
      setTheme(user.preferences.theme || 'dark');
      setColorTheme(user.preferences.colorTheme || 'orange');
      
      // Check if the user needs to go through the initial vehicle setup
      const setupParam = searchParams.get('setup');
      if (setupParam === 'true' && (!user.vehicles || user.vehicles.length === 0)) {
        setIsInitialSetup(true);
      } else {
        setIsInitialSetup(false);
      }
    }
  }, [user, loading, searchParams, pathname]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-color-theme', colorTheme);
  }, [theme, colorTheme]);
  
  const isAuthPage = pathname === '/login' || pathname === '/cadastro' || pathname === '/recuperar' || pathname === '/landing';

  // Redirect to login if not authenticated and not on an auth page.
  // This also runs only on the client.
  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, isAuthPage, router]);
  
  if (loading || (!user && !isAuthPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isInitialSetup) {
      return <VehicleSetup />;
  }
  
  // This should only be reached if the user is loaded and authenticated
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20">
        {children}
      </main>
    </div>
  );
}

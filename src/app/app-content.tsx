
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

  useEffect(() => {
    if (user) {
      setTheme(user.preferences.theme || 'dark');
      setColorTheme(user.preferences.colorTheme || 'orange');
      const setupParam = searchParams.get('setup');
      if (setupParam === 'true' && user.vehicles.length === 0) {
        setIsInitialSetup(true);
      } else {
        setIsInitialSetup(false);
      }
    } else {
      setIsInitialSetup(false);
    }
  }, [user, searchParams, pathname]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-color-theme', colorTheme);
  }, [theme, colorTheme]);
  
  const isAuthPage = pathname === '/login' || pathname === '/cadastro' || pathname === '/recuperar';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, isAuthPage, router]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (isInitialSetup) {
      return <VehicleSetup />;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }
  
  if (!user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20">
        {children}
      </main>
    </div>
  );
}

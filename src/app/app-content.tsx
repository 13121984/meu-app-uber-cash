
"use client";

import { useAuth } from '@/contexts/auth-context';
import { TopBar } from '@/components/layout/top-bar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSettings } from '@/services/settings.service';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { VehicleSetup } from '@/components/configuracoes/vehicle-setup';
import { useSearchParams } from 'next/navigation'

export function AppContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams()
  const router = useRouter();
  const [theme, setTheme] = useState('dark');
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    if (user) {
      // Set theme based on user preferences
      getSettings(user.id).then(settings => {
        setTheme(settings.theme);
      });
      // Check for vehicle setup condition
      const setupParam = searchParams.get('setup');
      if (setupParam === 'true' && user.vehicles.length === 0) {
        setIsInitialSetup(true);
      } else {
        setIsInitialSetup(false);
      }
    } else {
        setIsInitialSetup(false);
    }
  }, [user, searchParams]);

  useEffect(() => {
    // Apply theme to HTML element
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  const isAuthPage = pathname === '/login' || pathname === '/cadastro' || pathname === '/recuperar';

  useEffect(() => {
    // If not loading, no user, and not on an auth page, redirect to login.
    if (!loading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, isAuthPage, router]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Render vehicle setup flow if required
  if (isInitialSetup) {
      return <VehicleSetup />;
  }

  // If on an auth page, render content directly
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // If user is not logged in yet (and redirect hasn't happened), show nothing
  if (!user) {
    return null;
  }
  

  // Render the main app layout for authenticated users
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20">
        {children}
      </main>
    </div>
  );
}

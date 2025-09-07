
"use client";

import { useAuth } from '@/contexts/auth-context';
import { TopBar } from '@/components/layout/top-bar';
import { usePathname } from 'next/navigation';

export function AppContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/cadastro');

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Se não estiver em uma página de autenticação, e não estiver carregando,
  // e não houver usuário, não renderize nada (o useEffect no page.tsx cuidará do redirect).
  if (!loading && !user) {
    return null; 
  }

  // Renderiza o layout principal para usuários autenticados
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20">
        {children}
      </main>
    </div>
  );
}

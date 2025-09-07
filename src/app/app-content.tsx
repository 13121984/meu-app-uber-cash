
"use client";

import { useAuth } from '@/contexts/auth-context';
import { TopBar } from '@/components/layout/top-bar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AppContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';

  useEffect(() => {
    // Se não estiver carregando, não houver usuário, e não estivermos numa página de auth, redireciona para login.
    if (!loading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, isAuthPage, router]);

  // Se for uma página de autenticação, renderiza o conteúdo diretamente sem o layout principal.
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Se estiver carregando ou se o usuário não estiver logado (e o redirect ainda não ocorreu),
  // não mostre o conteúdo principal para evitar um piscar da tela.
  if (loading || !user) {
    // Opcional: pode retornar um loader global aqui se preferir.
    // Por enquanto, o loader da página específica (como em page.tsx) cuidará disso.
    return null;
  }

  // Renderiza o layout principal para usuários autenticados
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      <TopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20">
        {children}
      </main>
    </div>
  );
}


"use client";

import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const unprotectedRoutes = ['/login'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user && !unprotectedRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Se a rota for pública (login), renderiza sem verificar o usuário
  if (unprotectedRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Enquanto carrega, mostra uma tela de loading
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Se houver usuário, renderiza o conteúdo da rota protegida
  if (user) {
    return <>{children}</>;
  }

  // Fallback, teoricamente não deveria ser alcançado devido ao useEffect
  return null;
}


"use client";

import { useAuth } from '@/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

const unprotectedRoutes = ['/login'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Aguarda o fim do carregamento

    const isProtectedRoute = !unprotectedRoutes.includes(pathname);

    // Se o usuário não está logado e tenta acessar uma rota protegida
    if (!user && isProtectedRoute) {
      router.push('/login');
    }
    
    // Se o usuário está logado e tenta acessar uma rota desprotegida (como /login)
    if (user && !isProtectedRoute) {
        router.push('/');
    }

  }, [user, loading, router, pathname]);

  // Enquanto carrega, mostra uma tela de loading global
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Se a rota for pública (login) e o usuário não estiver logado, renderiza o conteúdo da página
  if (!user && unprotectedRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Se houver usuário e a rota for protegida, renderiza o layout completo do aplicativo
  if (user && !unprotectedRoutes.includes(pathname)) {
    return (
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
    );
  }

  // Fallback para evitar renderização incorreta enquanto o redirecionamento acontece
  return null;
}

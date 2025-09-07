
"use client";

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { HomeClient } from '@/components/inicio/home-client';
import { VehicleSetup } from '@/components/configuracoes/vehicle-setup';


export default function PageRouter() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Se o usuário está logado mas não tem veículo, mostra o setup do veículo
    if (user && user.vehicles && user.vehicles.length === 0) {
        return <VehicleSetup />;
    }
    
    // Se tudo estiver ok, mostra a página inicial
    return <HomeClient />;
}

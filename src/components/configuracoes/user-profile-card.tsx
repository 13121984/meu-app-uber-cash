
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Crown, LogOut, Gem } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserProfileCard() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    }

    if (!user) {
        return null; // ou um skeleton
    }
    
    const getPlanInfo = () => {
        switch (user.plan) {
            case 'pro':
                return { name: 'Pro', icon: Gem, className: 'text-blue-500' };
            case 'autopilot':
                return { name: 'Autopilot', icon: Crown, className: 'text-yellow-500' };
            default:
                return { name: 'Básico', icon: null, className: '' };
        }
    };
    
    const planInfo = getPlanInfo();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <User className="h-6 w-6 text-primary" />
                        Perfil do Usuário
                    </CardTitle>
                    <CardDescription>
                        Informações da sua conta e plano.
                    </CardDescription>
                </div>
                 <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 bg-secondary/50 rounded-lg">
                <div className="space-y-1">
                    <p className="text-lg font-bold">{user.id}</p>
                    <p className="text-sm text-muted-foreground">Usuário</p>
                </div>
                <div className={cn("flex items-center gap-2 mt-4 sm:mt-0 p-3 rounded-full bg-background", planInfo.className)}>
                    {planInfo.icon && <planInfo.icon className="h-5 w-5" />}
                    <span className="font-semibold">Plano {planInfo.name}</span>
                </div>
            </CardContent>
        </Card>
    );
}

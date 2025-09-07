
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatalogManagerCardProps {
    isPremium: boolean;
}

export function CatalogManagerCard({ isPremium }: CatalogManagerCardProps) {
    return (
        <Card className={cn(!isPremium && "bg-secondary/50")}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <BookCopy className="h-6 w-6 text-primary" />
                    Gerenciar Catálogos
                    {!isPremium && <Lock className="h-5 w-5 text-amber-500" />}
                </CardTitle>
                <CardDescription>
                    {isPremium 
                        ? "Personalize as categorias de ganhos e tipos de combustível para adequar o aplicativo às suas necessidades."
                        : "Assine o plano Premium para criar, editar e organizar suas próprias categorias de ganhos e despesas."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href={isPremium ? "/configuracoes/catalogos" : "/premium"} passHref legacyBehavior>
                    <Button as="a">
                         <span>{isPremium ? "Editar Catálogos" : "Desbloquear com Premium"}</span>
                         <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

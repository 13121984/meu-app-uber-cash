
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, ArrowRight } from "lucide-react";

export function CatalogManagerCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <BookCopy className="h-6 w-6 text-primary" />
                    Gerenciar Catálogos
                </CardTitle>
                <CardDescription>
                    Personalize as categorias de ganhos e tipos de combustível para adequar o aplicativo às suas necessidades.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/configuracoes/catalogos" passHref>
                    <Button>
                        <span>Editar Catálogos</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

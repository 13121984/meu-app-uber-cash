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
                   Organize suas categorias de ganhos e combustíveis para adequar o aplicativo às suas necessidades.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/configuracoes/catalogos" passHref>
                  <Button asChild>
                    <span>
                        Editar Catálogos
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

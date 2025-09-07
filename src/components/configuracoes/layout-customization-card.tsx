
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export function LayoutCustomizationCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    Personalizar Layout
                </CardTitle>
                <CardDescription>
                    Reordene os cards e gráficos da sua página de relatórios para focar nas métricas mais importantes para você.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/configuracoes/layout-personalizado" passHref>
                    <Button>
                        <span>Organizar Relatórios</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

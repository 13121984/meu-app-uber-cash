
// This component is no longer needed as its content has been moved to the main help page.
// This file can be safely deleted.
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AndroidGuideCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Guia do Desenvolvedor (Obsoleto)</CardTitle>
                 <CardDescription>
                    Este guia foi movido para a Central de Ajuda para uma melhor organização.
                 </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Por favor, acesse a Central de Ajuda para ver o guia técnico completo.</p>
            </CardContent>
        </Card>
    );
}

    

"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, ArrowRight } from "lucide-react";

export function HelpAndSupportCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <LifeBuoy className="h-6 w-6 text-primary" />
                    Ajuda e Suporte
                </CardTitle>
                <CardDescription>
                    Acesse nossa central de ajuda para ver tutoriais, guias e tirar suas dúvidas sobre o aplicativo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/ajuda" passHref>
                    <Button>
                        <span>Acessar Central de Ajuda</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

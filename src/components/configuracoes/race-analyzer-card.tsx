"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BotMessageSquare, ArrowRight } from "lucide-react";

export function RaceAnalyzerCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <BotMessageSquare className="h-6 w-6 text-primary" />
                    Analisador de Corridas
                </CardTitle>
                <CardDescription>
                    Use a IA para analisar um print de uma oferta de corrida e decidir se vale a pena aceitar com base nas suas metas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/analisador" passHref>
                    <Button>
                        <span>Abrir Analisador</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

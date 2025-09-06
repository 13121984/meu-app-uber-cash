
"use client"

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatabaseBackup, ArrowRight } from "lucide-react";

export function BackupCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <DatabaseBackup className="h-6 w-6 text-primary" />
                    Backup dos Dados
                </CardTitle>
                <CardDescription>
                    Crie um ponto de restauração (arquivo CSV) com todos os seus dados para guardá-lo em um local seguro.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/configuracoes/backup" passHref>
                    <Button>
                        <span>Gerenciar Backups</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

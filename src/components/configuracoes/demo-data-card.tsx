
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Sparkles, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { loadDemoDataAction, clearAllDataForUserAction } from "@/app/gerenciamento/actions";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";


export function DemoDataCard() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLoadDemo = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await loadDemoDataAction(user.id);
            toast({ title: "Sucesso!", description: "Dados de demonstração foram carregados."});
            router.refresh();
        } catch(e) {
            toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive"});
        }
        setIsLoading(false);
    };

    const handleClearData = async () => {
        if (!user) return;
        setIsDeleting(true);
         try {
            await clearAllDataForUserAction(user.id);
            toast({ title: "Sucesso!", description: "Todos os seus registros foram apagados."});
            router.refresh();
        } catch(e) {
            toast({ title: "Erro", description: "Não foi possível apagar os dados.", variant: "destructive"});
        }
        setIsDeleting(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Database className="h-6 w-6 text-primary" />
                    Gerenciamento de Dados
                </CardTitle>
                <CardDescription>
                    Use essas ações para carregar dados de exemplo ou limpar todos os seus registros.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleLoadDemo} variant="outline" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    Carregar Dados de Demonstração
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4" />}
                            Apagar Todos os Registros
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso apagará permanentemente TODOS os seus dias de trabalho, abastecimentos e manutenções. Seus dados de usuário e configurações serão mantidos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/80">
                                Sim, apagar tudo
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardContent>
        </Card>
    );
}

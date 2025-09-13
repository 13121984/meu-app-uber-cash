
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { importWorkDaysAction } from '@/app/gerenciamento/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from '@/contexts/auth-context';


export function ImportCard() {
    const router = useRouter();
    const { user } = useAuth();
    const [isImporting, setIsImporting] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
        } else {
            setFileName('');
        }
    };
    
    const handleFileImport = async () => {
        if (!fileInputRef.current?.files?.length || !user) {
            toast({
                title: "Nenhum arquivo selecionado",
                description: "Por favor, escolha um arquivo CSV para importar.",
                variant: "destructive"
            });
            return;
        }

        const file = fileInputRef.current.files[0];
        setIsImporting(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawCsvText = e.target?.result;
            if (typeof rawCsvText !== 'string') {
                toast({ title: "Erro", description: "Não foi possível ler o arquivo.", variant: "destructive" });
                setIsImporting(false);
                return;
            }

            try {
                toast({
                    title: "Processando Planilha...",
                    description: "Analisando e formatando seu arquivo. Isso pode levar um momento.",
                });

                const result = await importWorkDaysAction(user.id, rawCsvText);
                
                if (result.success) {
                    toast({
                        title: "Importação Concluída!",
                        description: (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>{`${result.count} dias de registros foram importados/atualizados com sucesso.`}</span>
                            </div>
                        ),
                    });
                    router.refresh();
                } else {
                    throw new Error(result.error || "Ocorreu um erro desconhecido durante a importação final.");
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao processar o arquivo.";
                toast({
                    title: "Erro na Importação",
                    description: (
                        <div className="flex items-center gap-2">
                             <AlertTriangle className="h-5 w-5 text-destructive" />
                             <span>{errorMessage}</span>
                        </div>
                    ),
                    variant: "destructive",
                });
            } finally {
                setIsImporting(false);
                setFileName('');
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file, 'ISO-8859-1'); 
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Upload className="h-6 w-6 text-primary" />
                    Importar Planilha (CSV)
                </CardTitle>
                <CardDescription>
                    Faça o upload do seu arquivo CSV com o histórico de registros.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="file-upload" className="sr-only">Escolher arquivo</label>
                    <Input 
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-primary/10 file:text-primary
                                   hover:file:bg-primary/20"
                    />
                </div>
                 <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Ver estrutura de arquivo recomendada</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-md">
                      <p className='mb-4'>Para garantir uma importação sem erros, seu arquivo CSV deve ter os seguintes cabeçalhos na primeira linha:</p>
                      <code className="block bg-muted text-foreground p-2 rounded-md my-2 text-xs">
                        date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount
                      </code>
                       <p className='mt-4'>
                         **Dica:** A melhor maneira de obter o formato correto é ir para a página de 'Relatórios', aplicar um filtro e clicar em 'Baixar CSV'. Use esse arquivo como seu modelo.
                       </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleFileImport} disabled={isImporting || !fileName} className="w-full flex-1">
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Arquivo
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { addMultipleWorkDays, type ImportedWorkDay } from '@/services/work-day.service';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const CSV_HEADERS = [
    'date', 'km', 'hours', 
    'earnings_category', 'earnings_trips', 'earnings_amount',
    'fuel_type', 'fuel_paid', 'fuel_price',
    'maintenance_description', 'maintenance_amount'
];

export function ImportCard() {
    const router = useRouter();
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
        if (!fileInputRef.current?.files?.length) {
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
            const text = e.target?.result;
            if (typeof text !== 'string') {
                toast({ title: "Erro", description: "Não foi possível ler o arquivo.", variant: "destructive" });
                setIsImporting(false);
                return;
            }

            try {
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");
                }

                const header = lines[0].split(',').map(h => h.trim());
                // Validação mais flexível do cabeçalho (ignora espaços extras e case)
                const normalizedHeader = JSON.stringify(header.map(h => h.toLowerCase().trim()));
                const normalizedExpectedHeader = JSON.stringify(CSV_HEADERS.map(h => h.toLowerCase().trim()));

                if (normalizedHeader !== normalizedExpectedHeader) {
                    console.error("Cabeçalho esperado:", CSV_HEADERS);
                    console.error("Cabeçalho recebido:", header);
                    throw new Error("O cabeçalho do arquivo CSV está incorreto. Verifique as colunas e a ordem.");
                }

                const data: Record<string, string>[] = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return CSV_HEADERS.reduce((obj, nextKey, index) => {
                        obj[nextKey] = values[index]?.trim() || '';
                        return obj;
                    }, {} as Record<string, string>);
                });

                const result = await addMultipleWorkDays(data as ImportedWorkDay[]);
                
                if (result.success) {
                    toast({
                        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Importação Concluída!</span></div>,
                        description: `${result.count} dias de trabalho foram importados com sucesso.`,
                    });
                    router.refresh(); // Recarrega os dados em outras páginas
                } else {
                    throw new Error(result.error || "Ocorreu um erro desconhecido durante a importação.");
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao processar o arquivo.";
                toast({
                    title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro na Importação</span></div>,
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setIsImporting(false);
                setFileName('');
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Upload className="h-6 w-6 text-primary" />
                    Importar Dados por CSV
                </CardTitle>
                <CardDescription>
                    Faça o upload de um arquivo CSV com seu histórico para adicioná-lo ao aplicativo.
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
                            <span>Ver detalhes da estrutura do arquivo</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground p-4 bg-secondary/30 rounded-md">
                      <ul className="space-y-2 list-disc pl-5">
                          <li>O arquivo deve estar no formato <strong>CSV</strong> (valores separados por vírgula).</li>
                          <li>A primeira linha do arquivo deve ser o <strong>cabeçalho</strong>.</li>
                           <li>As colunas devem seguir a seguinte <strong>ordem e nome</strong>:
                            <code className="block bg-muted text-foreground p-2 rounded-md my-2 text-xs">
                                date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount
                            </code>
                          </li>
                          <li>
                            <strong>Agrupamento por Data:</strong> O sistema agrupa múltiplas linhas com a mesma data (`AAAA-MM-DD`) em um único registro de dia de trabalho.
                          </li>
                           <li>
                             <strong>Campos numéricos</strong> como `km` e `hours` devem usar ponto (`.`) como separador decimal (Ex: `120.5`).
                           </li>
                          <li>
                            Você pode ter múltiplas linhas para o mesmo dia para registrar diferentes ganhos ou abastecimentos.
                          </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Button onClick={handleFileImport} disabled={isImporting || !fileName} className="w-full">
                    {isImporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importando...
                        </>
                    ) : (
                        "Importar Arquivo"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

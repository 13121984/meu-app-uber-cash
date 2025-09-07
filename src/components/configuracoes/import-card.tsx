"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
import { addMultipleWorkDays, type ImportedWorkDay } from '@/services/work-day.service';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Cabeçalhos que o app espera no final do processo.
const TARGET_CSV_HEADERS = [
    'date', 'km', 'hours', 
    'earnings_category', 'earnings_trips', 'earnings_amount',
    'fuel_type', 'fuel_paid', 'fuel_price',
    'maintenance_description', 'maintenance_amount'
];

// Função para converter o formato de tempo HH:mm:ss para horas decimais
const timeToDecimal = (time: string): number => {
    if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) return 0;
    const parts = time.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return hours + minutes / 60 + seconds / 3600;
};

// Função para processar manualmente o CSV do usuário
function processManualCsv(rawCsvText: string): ImportedWorkDay[] {
    const lines = rawCsvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    const dataForImport: ImportedWorkDay[] = [];

    for (const row of rows) {
        const values = row.split(',');
        const rowData: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim();
        });

        // 1. Extrair dados base (Data, KM, Horas)
        const dateRaw = rowData['data'] || '';
        let formattedDate = '';
        try {
            // Tenta parsear formatos como DD/MM/YY ou DD/MM/YYYY
            const parsedDate = parse(dateRaw, 'dd/MM/yy', new Date());
            if (isNaN(parsedDate.getTime())) throw new Error();
            formattedDate = format(parsedDate, 'yyyy-MM-dd');
        } catch (e) {
            console.warn(`Data inválida encontrada: "${dateRaw}". Pulando linha.`);
            continue; // Pula para a próxima linha se a data for inválida
        }

        const km = (rowData['kms percorridos'] || rowData['km'] || '0').replace(',', '.');
        const hoursRaw = rowData['horas trabalhadas'] || rowData['hours'] || '0';
        const hours = timeToDecimal(hoursRaw).toString();
        
        let isFirstEntryForDate = true;

        // 2. Processar Ganhos (iterar por todas as colunas)
        for (const header of headers) {
            if (header.includes('viagens') || header.includes('valor por')) continue; // Ignora colunas auxiliares

            const amountRaw = rowData[header];
            const amount = parseFloat(amountRaw?.replace(/[^0-9,.]/g, '').replace(',', '.') || '0');

            if (amount > 0) {
                 // Assumindo que a categoria de ganho não é uma dessas palavras-chave
                if (!['data', 'kms percorridos', 'km', 'horas trabalhadas', 'gnv', 'etanol', 'gasolina'].some(kw => header.includes(kw))) {
                     const tripsHeader = headers.find(h => h.startsWith(header) && h.includes('viagens')) || 'viagens';
                     const trips = rowData[tripsHeader] || '0';
                     
                     dataForImport.push({
                        date: isFirstEntryForDate ? formattedDate : '',
                        km: isFirstEntryForDate ? km : '',
                        hours: isFirstEntryForDate ? hours : '',
                        earnings_category: header,
                        earnings_trips: trips,
                        earnings_amount: amount.toString(),
                        fuel_type: '', fuel_paid: '', fuel_price: '',
                        maintenance_description: '', maintenance_amount: ''
                    });
                    isFirstEntryForDate = false;
                }
            }
        }

        // 3. Processar Combustíveis
        for (const header of headers) {
             const amountRaw = rowData[header];
             const amount = parseFloat(amountRaw?.replace(/[^0-9,.]/g, '').replace(',', '.') || '0');

            if (amount > 0) {
                if (['gnv', 'etanol', 'gasolina'].some(kw => header.includes(kw))) {
                     // Encontra a coluna de preço correspondente
                    const priceHeader = headers.find(h => h.includes('valor por') && h.includes(header.split(' ')[0])) || '';
                    const price = (rowData[priceHeader] || '0').replace(',', '.');

                    dataForImport.push({
                        date: isFirstEntryForDate ? formattedDate : '',
                        km: isFirstEntryForDate ? km : '',
                        hours: isFirstEntryForDate ? hours : '',
                        earnings_category: '', earnings_trips: '', earnings_amount: '',
                        fuel_type: header,
                        fuel_paid: amount.toString(),
                        fuel_price: price,
                        maintenance_description: '', maintenance_amount: ''
                    });
                    isFirstEntryForDate = false;
                }
            }
        }
    }

    return dataForImport;
}


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

                // ETAPA 1: Processar o CSV manualmente
                const processedData = processManualCsv(rawCsvText);
                
                if (processedData.length === 0) {
                    throw new Error("Nenhum dado válido encontrado na planilha. Verifique o formato e os cabeçalhos.");
                }

                // ETAPA 2: Importar os dados estruturados
                const result = await addMultipleWorkDays(processedData);
                
                if (result.success) {
                    toast({
                        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Importação Concluída!</span></div>,
                        description: `${result.count} registros de dias foram importados/atualizados com sucesso.`,
                    });
                    router.refresh();
                } else {
                    throw new Error(result.error || "Ocorreu um erro desconhecido durante a importação final.");
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

        reader.readAsText(file, 'ISO-8859-1'); // Use um encoding comum para arquivos CSV do Excel
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Importador de Planilhas (CSV)
                </CardTitle>
                <CardDescription>
                    Faça o upload do seu arquivo CSV com seus registros. O sistema tentará organizar os dados para importação.
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
                      <p className='mb-4'>O importador tentará entender sua planilha, mas usar estes nomes de coluna (em qualquer ordem) garante os melhores resultados.</p>
                      <ul className="space-y-2 list-disc pl-5">
                          <li>O arquivo deve estar no formato <strong>CSV</strong> (valores separados por vírgula).</li>
                          <li>A primeira linha do arquivo deve ser o <strong>cabeçalho</strong>.</li>
                           <li>Colunas-chave que o sistema procura: 
                            <code className="block bg-muted text-foreground p-2 rounded-md my-2 text-xs">
                                Data, Kms Percorridos, Horas Trabalhadas, [Nome da Categoria de Ganho], Viagens, [Nome do Combustível], [Valor por litro/m³]
                            </code>
                          </li>
                          <li>
                            **Ganhos:** Colunas separadas para cada categoria (ex: "99 Pop", "Uber Cash").
                          </li>
                           <li>
                             **Valores Monetários:** Podem usar "R$" e vírgula como decimal (ex: `R$ 120,50`).
                           </li>
                           <li>
                             **Datas:** Formato `DD/MM/YY` ou `DD/MM/YYYY`.
                           </li>
                      </ul>
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
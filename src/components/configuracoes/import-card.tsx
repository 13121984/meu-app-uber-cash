
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Upload, Loader2, CheckCircle, AlertTriangle, BookOpen, Sparkles, Copy } from 'lucide-react';
import { addMultipleWorkDays, type ImportedWorkDay } from '@/services/work-day.service';
import { useRouter } from 'next/navigation';
import { format, parse } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


// Função para converter o formato de tempo HH:mm:ss para horas decimais
const timeToDecimal = (time: string): number => {
    if (!time || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(time.trim())) return 0;
    const parts = time.trim().split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return hours + minutes / 60 + seconds / 3600;
};

// Nova função de processamento manual, mais robusta
function processManualCsv(rawCsvText: string): ImportedWorkDay[] {
    const lines = rawCsvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("O arquivo CSV está vazio ou contém apenas o cabeçalho.");

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);
    
    const dataByDate = new Map<string, Partial<ImportedWorkDay>[]>();
    let lastDate = '';
    let lastKm = '';
    let lastHours = '';

    const dateIndex = headers.indexOf('date');
    const kmIndex = headers.indexOf('km');
    const hoursIndex = headers.indexOf('hours');

    // Agrupa todos os dados por data
    for (const row of rows) {
        const values = row.split(',');
        const rowData: Partial<ImportedWorkDay> = {};

        headers.forEach((header, index) => {
            if (values[index]) {
                (rowData as any)[header] = values[index].trim();
            }
        });

        let currentDate = '';
        if (values[dateIndex]) {
            try {
                // Use a reference date to avoid timezone issues. We only care about the date part.
                const referenceDate = new Date();
                const parsedDate = parse(values[dateIndex], 'yyyy-MM-dd', referenceDate);
                if (isNaN(parsedDate.getTime())) throw new Error('Data inválida');
                currentDate = format(parsedDate, 'yyyy-MM-dd');
                lastDate = currentDate;
                lastKm = values[kmIndex] || '0';
                lastHours = values[hoursIndex] || '0';
            } catch (e) {
                continue; 
            }
        } else {
            currentDate = lastDate;
        }

        if (!currentDate) continue;

        if (!dataByDate.has(currentDate)) {
            dataByDate.set(currentDate, []);
        }
        
        const dataForThisDate = dataByDate.get(currentDate)!;
        
        // Atribui a data, km e horas a cada linha de dados
        const fullRowData = {
          ...rowData,
          date: currentDate,
          km: lastKm,
          hours: lastHours
        };

        dataForThisDate.push(fullRowData);
    }
    
    // Transforma os dados agrupados no formato final
    const finalDataForImport: ImportedWorkDay[] = [];
    for (const [date, entries] of dataByDate.entries()) {
        const firstEntry = entries[0];
        
        for(const entry of entries) {
            finalDataForImport.push({
                date: entry.date!,
                km: firstEntry.km || '0',
                hours: timeToDecimal(firstEntry.hours!).toString(), // Converte horas aqui
                earnings_category: entry.earnings_category || '',
                earnings_trips: entry.earnings_trips || '',
                earnings_amount: entry.earnings_amount || '',
                fuel_type: entry.fuel_type || '',
                fuel_paid: entry.fuel_paid || '',
                fuel_price: entry.fuel_price || '',
                maintenance_description: entry.maintenance_description || '',
                maintenance_amount: entry.maintenance_amount || ''
            });
        }
    }
    
    if (finalDataForImport.length === 0) {
        throw new Error("Nenhum dado válido foi encontrado na planilha. Verifique se os cabeçalhos e formatos de dados estão corretos.");
    }
    
    return finalDataForImport;
}

const promptToCopy = `Você é um especialista em processamento de dados e sua tarefa é transformar um CSV de um formato "largo" para um formato "longo", seguindo regras específicas.

**Formato do CSV de Entrada (exemplo):**
O CSV de entrada tem uma linha por data. As colunas de ganhos e gastos são separadas por categoria. Por exemplo:
- **Ganhos:** Colunas como "99 Pop", "Ubex", "Particular", cada uma seguida por uma coluna "Viagens".
- **Gastos:** Colunas como "GNV", "Etanol", cada uma com uma coluna de preço ao lado ("Valor por M3" ou "valor por litro").
- **Outros Dados:** Colunas "Kms Percorridos" e "Horas Trabalhadas".

**Formato do CSV de Saída (REQUERIDO):**
O resultado final DEVE SER um CSV com os seguintes cabeçalhos, nesta ordem exata:
\`date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount\`

**Regras de Transformação:**
1.  **Estrutura "Longa":** Para cada linha do CSV de entrada, você criará múltiplas linhas no CSV de saída. Uma linha para cada registro de ganho e uma para cada registro de abastecimento.
2.  **Agrupamento por Data:** As colunas \`date\`, \`km\`, e \`hours\` só devem aparecer na primeira linha de um determinado dia. As linhas subsequentes para o mesmo dia devem ter essas colunas em branco.
3.  **Processamento de Ganhos:** Para cada coluna de ganho (ex: "99 Pop", "Ubex") que tiver um valor, crie uma nova linha:
    *   \`earnings_category\`: O nome da categoria (ex: "99 Pop").
    *   \`earnings_trips\`: O valor da coluna "Viagens" adjacente. Se não houver, use \`0\`.
    *   \`earnings_amount\`: O valor do ganho.
4.  **Processamento de Combustível:** Para cada coluna de combustível (ex: "GNV", "Etanol") que tiver um valor, crie uma nova linha:
    *   \`fuel_type\`: O nome do combustível (ex: "GNV").
    *   \`fuel_paid\`: O valor total pago pelo abastecimento.
    *   \`fuel_price\`: O preço por litro/m³, encontrado na coluna adjacente.
5.  **Conversão de Dados:**
    *   **Data:** Converta de \`DD/MM/YY\` para \`YYYY-MM-DD\`.
    *   **Horas:** Converta o formato \`HH:MM:SS\` ou \`HH:MM\` para um número decimal (ex: \`4:30:00\` se torna \`4.5\`).
    *   **Valores Numéricos:** Remova símbolos de moeda e use ponto (\`.\`) como separador decimal.
6.  **Colunas de Manutenção:** As colunas \`maintenance_description\` e \`maintenance_amount\` devem ser deixadas em branco, pois não existem no CSV de entrada.

**Exemplo de Transformação:**
Se a entrada for:
\`Data,99 Pop,Viagens,Etanol,valor por litro,Kms Percorridos,Horas Trabalhadas\`
\`01/01/25,111.51,12,50,5.09,72.2,4:30:00\`

A saída deve ser:
\`date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount\`
\`2025-01-01,72.2,4.5,99 Pop,12,111.51,,,,,,\`
\`,,,,,,Etanol,50,5.09,,\`

Agora, processe o seguinte CSV e gere a saída formatada:
`;


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
    
    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptToCopy)
            .then(() => {
                toast({
                    title: "Prompt Copiado!",
                    description: "Cole em uma IA junto com seu CSV para formatá-lo.",
                });
            })
            .catch(err => {
                toast({
                    title: "Erro ao copiar",
                    description: "Não foi possível copiar o prompt.",
                    variant: "destructive"
                });
            });
    }

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

                const processedData = processManualCsv(rawCsvText);
                
                if (processedData.length === 0) {
                    throw new Error("Nenhum dado válido encontrado na planilha. Verifique o formato e os cabeçalhos.");
                }

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

        reader.readAsText(file, 'ISO-8859-1'); 
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
                                date,km,hours,earnings_category,earnings_trips,earnings_amount,fuel_type,fuel_paid,fuel_price,maintenance_description,maintenance_amount
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
                           <li>
                             **Horas:** Formato `HH:MM` ou `HH:MM:SS`.
                           </li>
                      </ul>
                       <Button onClick={handleCopyPrompt} variant="ghost" className="mt-4 w-full">
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Prompt para IA (Formatação Externa)
                        </Button>
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

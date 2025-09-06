
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Download, Loader2, AlertTriangle, Info } from 'lucide-react';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { exportReportAction, ReportFilterValues } from '@/app/relatorios/actions';


interface ReportsFilterProps {
  initialFilters: ReportFilterValues;
}

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM', { locale: ptBR }),
}));

export function ReportsFilter({ initialFilters }: ReportsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [filterType, setFilterType] = useState<ReportFilterValues['type']>(initialFilters.type);
  const [year, setYear] = useState<number>(initialFilters.year || getYear(new Date()));
  const [month, setMonth] = useState<number>(initialFilters.month || new Date().getMonth());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialFilters.dateRange);
  const [isExporting, startExportTransition] = useTransition();
  const [currentFilters, setCurrentFilters] = useState<ReportFilterValues>(initialFilters);
  
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', filterType);

    const filters: ReportFilterValues = { type: filterType };

    if (filterType === 'specificMonth') {
        filters.year = year;
        filters.month = month;
        params.set('year', year.toString());
        params.set('month', month.toString());
    } else if (filterType === 'specificYear') {
        filters.year = year;
        params.set('year', year.toString());
    } else if (filterType === 'custom' && dateRange?.from) {
        filters.dateRange = dateRange;
        params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange.to) {
            params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
        }
    }
    
    startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
        setCurrentFilters(filters);
    });

  }, [filterType, year, month, dateRange, pathname, router]);
  
  const handleDownload = () => {
      startExportTransition(async () => {
        try {
            const result = await exportReportAction(currentFilters);

            if (result.csvContent) {
                 // Create a blob from the CSV content
                const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8;' });
                
                // Create a link element
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const fileName = `Relatorio_UberCash_${format(new Date(), 'yyyy-MM-dd')}.csv`;
                link.setAttribute("download", fileName);
                
                // Append to the document, click, and then remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                 toast({
                    title: "Exportação Iniciada",
                    description: `O arquivo ${fileName} será baixado.`,
                });
            } else {
                 throw new Error("O conteúdo do CSV está vazio.");
            }

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <span className="font-bold">Erro na Exportação</span>
                    </div>
                ),
                description: errorMessage,
                variant: "destructive",
            });
        }
      });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card items-center">
      <Select value={filterType} onValueChange={(val) => setFilterType(val as ReportFilterValues['type'])} disabled={isPending}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tipo de Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo o Período</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="thisWeek">Esta Semana</SelectItem>
          <SelectItem value="thisMonth">Este Mês</SelectItem>
          <SelectItem value="specificMonth">Mês Específico</SelectItem>
          <SelectItem value="specificYear">Ano Específico</SelectItem>
          <SelectItem value="custom">Período Personalizado</SelectItem>
        </SelectContent>
      </Select>
      
      {filterType === 'specificMonth' && (
        <>
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
        </>
      )}

      {filterType === 'specificYear' && (
        <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
            {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
        </Select>
      )}

      {filterType === 'custom' && (
         <Popover>
            <PopoverTrigger asChild>
            <Button
                id="date"
                variant={"outline"}
                disabled={isPending}
                className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {dateRange?.from ? (
                dateRange.to ? (
                    <>
                    {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                    {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                    </>
                ) : (
                    format(dateRange.from, "LLL dd, y", { locale: ptBR })
                )
                ) : (
                <span>Selecione um período</span>
                )}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
            />
            </PopoverContent>
        </Popover>
      )}

      <div className="flex-grow"></div>
      
      {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      
      <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isExporting || isPending}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {isExporting ? 'Exportando...' : 'Baixar CSV'}
      </Button>

    </div>
  );
}

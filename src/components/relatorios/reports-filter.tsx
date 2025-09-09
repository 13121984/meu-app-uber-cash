
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Download, Loader2, AlertTriangle, Check, FileDown } from 'lucide-react';
import { format, getYear, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { exportReportAction, ReportFilterValues } from '@/app/relatorios/actions';
import { generatePdf } from '@/lib/pdf-generator';
import { getReportData, ReportData } from '@/services/summary.service';


interface ReportsFilterProps {
  onApplyFilters: (filters: ReportFilterValues) => void;
  isPending: boolean;
  reportContentRef: React.RefObject<HTMLDivElement>;
}

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM', { locale: ptBR }),
}));

export function ReportsFilter({ onApplyFilters, isPending, reportContentRef }: ReportsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterType, setFilterType] = useState<ReportFilterValues['type'] | null>(null);
  const [year, setYear] = useState<number>(getYear(new Date()));
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isExporting, startExportTransition] = useTransition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const typeFromURL = searchParams.get('type') as ReportFilterValues['type'] | null;
    if (typeFromURL) {
      const yearFromURL = parseInt(searchParams.get('year') || getYear(new Date()).toString());
      const monthFromURL = parseInt(searchParams.get('month') || new Date().getMonth().toString());
      const fromParam = searchParams.get('from');
      let rangeFromURL: DateRange | undefined = undefined;

      if (fromParam) {
          const fromDate = parseISO(fromParam);
          if (isValid(fromDate)) {
              const toParam = searchParams.get('to');
              const toDate = toParam ? parseISO(toParam) : undefined;
              rangeFromURL = { from: fromDate, to: isValid(toDate) ? toDate : undefined };
          }
      }
      setFilterType(typeFromURL);
      setYear(yearFromURL);
      setMonth(monthFromURL);
      setDateRange(rangeFromURL);
      
      onApplyFilters({
          type: typeFromURL,
          year: yearFromURL,
          month: monthFromURL,
          dateRange: rangeFromURL
      });
    }
  }, []); 


  const handleApply = () => {
    if (!filterType) {
        toast({ title: "Selecione um período", description: "Você precisa escolher um tipo de período para gerar o relatório.", variant: "destructive" });
        return;
    }

    const filters: ReportFilterValues = { type: filterType };
    const params = new URLSearchParams();
    params.set('type', filterType);
    
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
    
    router.push(`${pathname}?${params.toString()}`);
    onApplyFilters(filters);
  };
  
  const getFiltersFromURL = (): ReportFilterValues | null => {
      const type = searchParams.get('type') as ReportFilterValues['type'] | null;
      if (!type) return null;

      return {
        type,
        year: parseInt(searchParams.get('year') || '0'),
        month: parseInt(searchParams.get('month') || '0'),
        dateRange: (() => {
            const fromParam = searchParams.get('from');
            const toParam = searchParams.get('to');
            if(fromParam) return { from: parseISO(fromParam), to: toParam ? parseISO(toParam) : undefined };
            return undefined;
        })()
      };
  };

  const handleDownloadCSV = () => {
      const filtersToExport = getFiltersFromURL();
      
      if (!filtersToExport) {
          toast({ title: "Nenhum relatório gerado", description: "Aplique um filtro primeiro para poder exportar os dados.", variant: "destructive"});
          return;
      }

      startExportTransition(async () => {
        try {
            const result = await exportReportAction(filtersToExport);

            if (result.csvContent) {
                const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const fileName = `Relatorio_RotaCerta_${format(new Date(), 'yyyy-MM-dd')}.csv`;
                link.setAttribute("download", fileName);
                
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
                title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span className="font-bold">Erro na Exportação</span></div>,
                description: errorMessage,
                variant: "destructive",
            });
        }
      });
  }

  const handleDownloadPDF = async () => {
    const filtersToExport = getFiltersFromURL();
      
    if (!filtersToExport) {
        toast({ title: "Nenhum relatório gerado", description: "Aplique um filtro primeiro para poder exportar os dados.", variant: "destructive"});
        return;
    }

    startExportTransition(async () => {
        try {
            const reportData: ReportData = await getReportData(filtersToExport);
            generatePdf(reportData, filtersToExport);
            toast({
                title: "Exportação PDF Iniciada",
                description: `O arquivo será baixado.`,
            });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado ao gerar o PDF.";
            toast({
                title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span className="font-bold">Erro na Exportação</span></div>,
                description: errorMessage,
                variant: "destructive",
            });
        }
    });
  };

  if (!isClient) {
      return (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-4 border rounded-lg bg-card items-center animate-pulse">
              <div className="h-10 bg-muted rounded-md w-full sm:w-auto sm:min-w-[180px]"></div>
              <div className="h-10 bg-muted rounded-md w-full sm:w-auto flex-1"></div>
              <div className="h-10 bg-muted rounded-md w-full sm:w-auto sm:w-32"></div>
              <div className="flex-grow"></div>
              <div className="h-10 bg-muted rounded-md w-full sm:w-auto sm:w-36"></div>
          </div>
      )
  }

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 p-4 border rounded-lg bg-card items-center">
      <Select value={filterType || ''} onValueChange={(val) => setFilterType(val as ReportFilterValues['type'])} disabled={isPending}>
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
          <SelectValue placeholder="Selecione um Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="thisWeek">Esta Semana</SelectItem>
          <SelectItem value="thisMonth">Este Mês</SelectItem>
          <SelectItem value="specificMonth">Mês Específico</SelectItem>
          <SelectItem value="specificYear">Ano Específico</SelectItem>
          <SelectItem value="custom">Período Personalizado</SelectItem>
          <SelectItem value="all">Todo o Período</SelectItem>
        </SelectContent>
      </Select>
      
      {filterType === 'specificMonth' && (
        <>
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-auto flex-1">
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
                "w-full sm:w-auto sm:min-w-[240px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {dateRange?.from ? (
                dateRange.to ? (
                    <>
                    {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                    {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                    </>
                ) : (
                    format(dateRange.from, "PPP", { locale: ptBR })
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

      <Button onClick={handleApply} className="w-full sm:w-auto" disabled={isPending || !filterType}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Aplicar Filtro
      </Button>

      <div className="flex-grow"></div>
      
       <Button onClick={handleDownloadPDF} variant="outline" className="w-full sm:w-auto" disabled={isExporting || isPending || !searchParams.get('type')}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          {isExporting ? 'Exportando...' : 'Baixar PDF'}
      </Button>

      <Button onClick={handleDownloadCSV} variant="outline" className="w-full sm:w-auto" disabled={isExporting || isPending || !searchParams.get('type')}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {isExporting ? 'Exportando...' : 'Baixar CSV'}
      </Button>
    </div>
  );
}

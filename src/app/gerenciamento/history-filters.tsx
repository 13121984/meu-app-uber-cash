
"use client";

import React, { useState, useEffect, useCallback, useTransition, TransitionStartFunction } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Download, Loader2, FilterX } from 'lucide-react';
import { format, getYear, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import type { ReportFilterValues } from '@/app/relatorios/actions';

interface HistoryFiltersProps {
  isPending: boolean;
  startTransition: TransitionStartFunction;
  onFiltersChange?: (filters: ReportFilterValues) => void;
  initialFilters?: ReportFilterValues;
}

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }),
}));

export function HistoryFilters({ isPending, startTransition, onFiltersChange, initialFilters }: HistoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterType, setFilterType] = useState<ReportFilterValues['type']>(() => searchParams.get('type') as ReportFilterValues['type'] || 'today');
  const [year, setYear] = useState<number>(() => parseInt(searchParams.get('year') || getYear(new Date()).toString()));
  const [month, setMonth] = useState<number>(() => parseInt(searchParams.get('month') || new Date().getMonth().toString()));
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
     const fromParam = searchParams.get('from');
     if (!fromParam) return undefined;
     const fromDate = parseISO(fromParam);
     if (!isValid(fromDate)) return undefined;
     const toParam = searchParams.get('to');
     const toDate = toParam ? parseISO(toParam) : undefined;
     return { from: fromDate, to: isValid(toDate) ? toDate : undefined };
  });
  
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', filterType);
    const newFilters: ReportFilterValues = { type: filterType };

    if (filterType === 'specificMonth') {
      newFilters.year = year;
      newFilters.month = month;
      params.set('year', year.toString());
      params.set('month', month.toString());
    } else if (filterType === 'specificYear') {
      newFilters.year = year;
      params.set('year', year.toString());
    } else if (filterType === 'custom' && dateRange?.from) {
      newFilters.dateRange = dateRange;
      params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) {
        params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
      }
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    });

  }, [filterType, year, month, dateRange, pathname, router, startTransition, onFiltersChange]);

  const handleClearFilters = () => {
    setFilterType('today');
    setDateRange(undefined);
    setYear(getYear(new Date()));
    setMonth(new Date().getMonth());
  };

  const hasActiveFilters = filterType !== 'today';

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={filterType} onValueChange={(val) => setFilterType(val as ReportFilterValues['type'])} disabled={isPending}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tipo de Período" />
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
      
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FilterX className="mr-2 h-4 w-4" />}
            Limpar
        </Button>
      )}

       {isPending && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
    </div>
  );
}

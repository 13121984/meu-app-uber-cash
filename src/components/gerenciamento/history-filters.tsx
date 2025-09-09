
"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import type { ReportFilterValues } from '@/app/relatorios/actions';
import { toast } from '@/hooks/use-toast';

interface HistoryFiltersProps {
  isPending: boolean;
  onFiltersChange: (filters: ReportFilterValues) => void;
}

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }),
}));

export function HistoryFilters({ isPending, onFiltersChange }: HistoryFiltersProps) {
  const [filterType, setFilterType] = useState<ReportFilterValues['type'] | null>(null);
  const [year, setYear] = useState<number>(getYear(new Date()));
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleApplyFilters = () => {
    if (!filterType) {
      toast({ title: "Selecione um período", description: "Você precisa escolher um tipo de período para gerar o relatório.", variant: "destructive" });
      return;
    }
    
    const filters: ReportFilterValues = { type: filterType };
    if (filterType === 'specificMonth') {
      filters.year = year;
      filters.month = month;
    } else if (filterType === 'specificYear') {
      filters.year = year;
    } else if (filterType === 'custom' && dateRange?.from) {
      filters.dateRange = dateRange;
    }

    onFiltersChange(filters);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select value={filterType || ""} onValueChange={(val) => setFilterType(val as ReportFilterValues['type'])} disabled={isPending}>
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
      
      <Button onClick={handleApplyFilters} disabled={isPending}>
          <Check className="mr-2 h-4 w-4"/>
          Aplicar Filtros
      </Button>
    </div>
  );
}

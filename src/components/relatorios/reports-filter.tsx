
"use client";

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';

export interface ReportFilterValues {
    type: 'all' | 'today' | 'thisWeek' | 'thisMonth' | 'specificMonth' | 'specificYear' | 'custom';
    year?: number;
    month?: number;
    dateRange?: DateRange;
}

interface ReportsFilterProps {
  onFilterChange: (filters: ReportFilterValues) => void;
}

const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - i);
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: format(new Date(0, i), 'MMMM', { locale: ptBR }),
}));

export function ReportsFilter({ onFilterChange }: ReportsFilterProps) {
  const [filterType, setFilterType] = useState<ReportFilterValues['type']>('thisMonth');
  const [year, setYear] = useState<number>(getYear(new Date()));
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    // Mapeia o estado local para o objeto de filtros e chama o callback
    const filters: ReportFilterValues = { type: filterType };
    if (filterType === 'specificMonth') {
        filters.year = year;
        filters.month = month;
    } else if (filterType === 'specificYear') {
        filters.year = year;
    } else if (filterType === 'custom') {
        filters.dateRange = dateRange;
    }
    onFilterChange(filters);
  }, [filterType, year, month, dateRange, onFilterChange]);
  
  const handleDownload = () => {
      // Lógica para download (a ser implementada)
      console.log("Downloading report with filters:", { filterType, year, month, dateRange });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card items-center">
      <Select value={filterType} onValueChange={(val) => setFilterType(val as ReportFilterValues['type'])}>
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
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
                <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
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
        <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
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
                className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
      
      <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Baixar
      </Button>

    </div>
  );
}

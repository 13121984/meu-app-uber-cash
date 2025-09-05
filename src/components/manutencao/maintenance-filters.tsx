
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Search, FilterX, Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';
import { useDebounce } from 'use-debounce';


export function MaintenanceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State for the inputs
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const [debouncedQuery] = useDebounce(query, 500);

  // This state ensures that client-side-only logic runs after hydration
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect synchronizes the URL with the component's state
  useEffect(() => {
    if (!isClient) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set('query', debouncedQuery);
    } else {
      params.delete('query');
    }
    if (dateRange?.from) {
      params.set('from', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) {
        params.set('to', format(dateRange.to, 'yyyy-MM-dd'));
      } else {
        params.delete('to');
      }
    } else {
      params.delete('from');
      params.delete('to');
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });

  }, [debouncedQuery, dateRange, pathname, router, searchParams, isClient]);

  // This effect synchronizes the component's state with the URL on initial load
  useEffect(() => {
    const queryParam = searchParams.get('query');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    setQuery(queryParam || '');

    if (fromParam) {
        try {
            const fromDate = parseISO(fromParam);
            const toDate = toParam ? parseISO(toParam) : undefined;
             if (isValid(fromDate)) {
              setDateRange({ from: fromDate, to: isValid(toDate) ? toDate : undefined });
            }
        } catch(e) {
            // Invalid date, do nothing
        }
    }
  }, [searchParams]);


  const handleClearFilters = () => {
    setQuery('');
    setDateRange(undefined);
  }

  const hasActiveFilters = !!(query || dateRange?.from);

  // Prevents rendering on the server and avoids hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por descrição..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
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
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
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
      
      {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
      
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters} disabled={isPending}>
            <FilterX className="mr-2 h-4 w-4" />
            Limpar
        </Button>
      )}

    </div>
  );
}


"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
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

interface HistoryFiltersProps {
  isPending: boolean;
}

export function HistoryFilters({ isPending }: HistoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for the inputs, initialized from URL search params
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam) {
      const fromDate = parseISO(fromParam);
      const toDate = toParam ? parseISO(toParam) : undefined;
      if (isValid(fromDate)) {
        return { from: fromDate, to: isValid(toDate) ? toDate : undefined };
      }
    }
    return undefined;
  });

  // Debounce the query input to avoid excessive URL updates
  const [debouncedQuery] = useDebounce(query, 500);

  // This state ensures that client-side-only logic runs after hydration
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const [_, startURLTransition] = useTransition();

  // This effect synchronizes the URL with the component's state
  const updateURL = useCallback(() => {
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
    
    startURLTransition(() => {
        // Using router.replace to avoid adding unnecessary entries to browser history
        router.replace(`${pathname}?${params.toString()}`);
    });

  }, [debouncedQuery, dateRange, pathname, router, searchParams]);

  useEffect(() => {
    // Only run this logic on the client
    if (isClient) {
      updateURL();
    }
  }, [isClient, updateURL]);


  const handleClearFilters = () => {
    setQuery('');
    setDateRange(undefined);
  };

  const hasActiveFilters = !!(searchParams.get('query') || searchParams.get('from'));

  // Prevents rendering on the server and avoids hydration mismatch by returning null until client is mounted
  if (!isClient) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          disabled={isPending}
        />
      </div>
      
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
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "PPP", { locale: ptBR })
              )
            ) : (
              <span>Filtrar por período</span>
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
            numberOfMonths={1}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FilterX className="mr-2 h-4 w-4" />}
            Limpar
        </Button>
      )}
    </div>
  );
}


"use client";

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from "react-day-picker";
import { WorkDay } from "@/services/work-day.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from 'lucide-react';
import { HistoryFilters, FilterValues } from './history-filters';

interface HistoryClientProps {
  data: WorkDay[];
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getCategories = (day: WorkDay) => {
    const categories = day.earnings.map(e => e.category).filter(c => c !== 'Ganhos Extras');
    if (categories.length === 0 && day.earnings.some(e => e.category === 'Ganhos Extras')) {
        return ['extras'];
    }
    return [...new Set(categories)];
};


export function HistoryClient({ data }: HistoryClientProps) {
  const [filters, setFilters] = useState<FilterValues>({
    query: '',
    category: 'all',
    dateRange: undefined
  });
  
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach(day => {
        day.earnings.forEach(earning => {
            if(earning.category !== 'Ganhos Extras') {
                categories.add(earning.category);
            }
        });
    });
    return Array.from(categories);
  }, [data]);

  const filteredWorkDays = useMemo(() => {
    return data.filter(day => {
      // Filtro por Data
      if (filters.dateRange?.from) {
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0); // Início do dia

        let toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : new Date(filters.dateRange.from);
        toDate.setHours(23, 59, 59, 999); // Fim do dia

        const dayDate = new Date(day.date);
        
        if (dayDate < fromDate || dayDate > toDate) {
          return false;
        }
      }

      // Filtro por Categoria
      if (filters.category !== 'all') {
        if (!day.earnings.some(e => e.category === filters.category)) {
          return false;
        }
      }

      // Filtro por Query de Texto
      if (filters.query) {
        const queryLower = filters.query.toLowerCase();
        const dateFormatted = format(day.date, "dd/MM/yyyy");
        
        const matchesQuery = 
            dateFormatted.includes(queryLower) ||
            day.earnings.some(e => e.category.toLowerCase().includes(queryLower));
            
        if (!matchesQuery) {
            return false;
        }
      }
      
      return true;
    });
  }, [data, filters]);


  const calculateProfit = (day: WorkDay) => {
    const earnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const fuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    return earnings - fuel;
  };

  const getTotalTrips = (day: WorkDay) => {
      return day.earnings.reduce((sum, e) => sum + e.trips, 0);
  }

  const handleDeleteAll = () => {
      // Adicionar lógica para apagar todos os registros, talvez com confirmação
      console.log("Apagar todos");
  }

  const handleEdit = (id?: string) => {
    console.log("Editar", id);
  }

  const handleDelete = (id?: string) => {
      console.log("Apagar", id);
  }

  return (
    <Card>
        <CardContent className="p-6 space-y-6">
            <HistoryFilters 
                categories={allCategories}
                onFilterChange={setFilters}
            />

             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-headline">Registros ({filteredWorkDays.length})</h2>
                {data.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Apagar Todos ({data.length})
                    </Button>
                )}
            </div>
            
            {filteredWorkDays.length === 0 && (
                <div className="text-center py-10">
                    <p className="font-semibold">Nenhum registro encontrado</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou adicione um novo registro.</p>
                </div>
            )}

            <div className="space-y-4">
                {filteredWorkDays.map(day => (
                    <Card key={day.id} className="bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <p className="font-bold text-lg">{format(day.date, "dd/MM/yyyy", { locale: ptBR })}</p>
                                <div className="flex flex-wrap items-center gap-2">
                                    {getCategories(day).map(cat => (
                                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {getTotalTrips(day)} viagens • {day.km} km • {day.hours}h
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="text-lg font-semibold text-green-500">{formatCurrency(calculateProfit(day))}</p>
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(day.id)}>
                                   <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(day.id)}>
                                   <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}

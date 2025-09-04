
"use client";

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WorkDay } from "@/services/work-day.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, DollarSign, TrendingUp, Fuel, Filter } from 'lucide-react';
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

const SummaryCard = ({ title, value, description, icon: Icon }: { title: string; value: string; description: string; icon: React.ElementType }) => (
    <Card className="bg-secondary/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


export function HistoryClient({ data: initialData }: HistoryClientProps) {
  const [filters, setFilters] = useState<FilterValues>({
    query: '',
    category: 'all',
    dateRange: undefined
  });

  const data = useMemo(() => {
    // Garante que todas as datas sejam objetos Date
    return initialData.map(day => ({
        ...day,
        date: new Date(day.date)
    }));
  }, [initialData]);
  
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
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data, filters]);

  const summaryData = useMemo(() => {
    let totalProfit = 0;
    let totalEarnings = 0;
    let totalFuel = 0;

    filteredWorkDays.forEach(day => {
        const earnings = day.earnings.reduce((sum, e) => sum + e.amount, 0);
        const fuel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
        totalEarnings += earnings;
        totalFuel += fuel;
        totalProfit += (earnings - fuel);
    });

    return { totalProfit, totalEarnings, totalFuel };
  }, [filteredWorkDays]);


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
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filtros e Resumo
            </CardTitle>
            <CardDescription>
                Filtre os registros e veja o resumo do período selecionado.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <HistoryFilters 
                categories={allCategories}
                onFilterChange={setFilters}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SummaryCard 
                    title="Lucro Líquido (Filtrado)"
                    value={formatCurrency(summaryData.totalProfit)}
                    description={`${filteredWorkDays.length} ${filteredWorkDays.length === 1 ? 'dia registrado' : 'dias registrados'}`}
                    icon={DollarSign}
                />
                 <SummaryCard 
                    title="Ganhos Brutos (Filtrado)"
                    value={formatCurrency(summaryData.totalEarnings)}
                    description="Total recebido das plataformas"
                    icon={TrendingUp}
                />
                 <SummaryCard 
                    title="Gastos (Combustível)"
                    value={formatCurrency(summaryData.totalFuel)}
                    description="Total gasto em abastecimentos"
                    icon={Fuel}
                />
            </div>

             <div className="flex justify-between items-center pt-4 border-t">
                <h2 className="text-xl font-bold font-headline">Registros ({filteredWorkDays.length})</h2>
                {data.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Apagar Todos ({data.length})
                    </Button>
                )}
            </div>
            
            {filteredWorkDays.length === 0 ? (
                <div className="text-center py-10">
                    <p className="font-semibold">Nenhum registro encontrado</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou adicione um novo registro.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredWorkDays.map(day => (
                        <Card key={day.id} className="bg-secondary/50 hover:bg-secondary/70 transition-colors">
                            <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <p className="font-bold text-lg">{format(day.date, "PPP", { locale: ptBR })}</p>
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
            )}
        </CardContent>
    </Card>
  );
}


"use client";

import { Dispatch, useCallback } from 'react';
import { PlusCircle, Trash2, Fuel, DollarSign, Wrench, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FuelEntry, MaintenanceEntry, State } from './registration-wizard';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import type { CatalogItem } from '@/services/catalog.service';
import Link from 'next/link';


type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };


interface Step3FuelProps {
  data: State;
  dispatch: Dispatch<Action>;
  fuelTypes: CatalogItem[];
}

export function Step3Fuel({ data, dispatch, fuelTypes }: Step3FuelProps) {
  const { isPro } = useAuth();

  const handleFuelEntriesChange = useCallback((newEntries: FuelEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'fuelEntries', value: newEntries } });
  }, [dispatch]);

  const handleMaintenanceEntriesChange = useCallback((newEntries: MaintenanceEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'maintenanceEntries', value: newEntries } });
  }, [dispatch]);

  const handleAddFuelEntry = () => {
    const defaultFuelType = fuelTypes.find(f => f.isDefault)?.name || fuelTypes[0]?.name || '';
    const newEntry: FuelEntry = { id: Date.now(), type: defaultFuelType, paid: 0, price: 0 };
    handleFuelEntriesChange([...data.fuelEntries, newEntry]);
  };
  
  const handleAddMaintenanceEntry = () => {
      const newEntry: MaintenanceEntry = { id: Date.now(), description: '', amount: 0 };
      handleMaintenanceEntriesChange([...data.maintenanceEntries, newEntry]);
  }

  const handleRemoveFuelEntry = (id: number) => {
    handleFuelEntriesChange(data.fuelEntries.filter((f) => f.id !== id));
  };
  
  const handleRemoveMaintenanceEntry = (id: number) => {
      handleMaintenanceEntriesChange(data.maintenanceEntries.filter(m => m.id !== id));
  }

  const handleFuelChange = (id: number, field: keyof Omit<FuelEntry, 'id'>, value: string | number) => {
    const updatedEntries = data.fuelEntries.map((f) => {
      if (f.id === id) {
        if (field === 'paid' || field === 'price') {
            const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
            return { ...f, [field]: isNaN(numValue) ? 0 : numValue };
        }
        return { ...f, [field]: String(value) };
      }
      return f;
    });
    handleFuelEntriesChange(updatedEntries);
  };
  
  const handleMaintenanceChange = (id: number, field: keyof Omit<MaintenanceEntry, 'id'>, value: string | number) => {
      const updatedEntries = data.maintenanceEntries.map((m) => {
          if (m.id === id) {
              if (field === 'amount') {
                   const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
                   return { ...m, [field]: isNaN(numValue) ? 0 : numValue };
              }
              // Garante que a descrição seja sempre uma string
              return { ...m, [field]: String(value) };
          }
          return m;
      });
      handleMaintenanceEntriesChange(updatedEntries);
  };


  return (
    <div className="space-y-6">
      {/* Seção de Abastecimentos */}
      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4 flex flex-row justify-between items-center">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Fuel className="h-5 w-5 text-destructive"/>
                Abastecimentos
            </CardTitle>
            <Button size="sm" type="button" onClick={handleAddFuelEntry} variant="destructive" disabled={fuelTypes.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
            {data.fuelEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Clique em "Adicionar" se abasteceu hoje.</p>
            ) : (
                data.fuelEntries.map((entry, index) => {
                    const volume = (entry.price > 0 && entry.paid > 0) ? (Number(entry.paid) / Number(entry.price)).toFixed(2) : '0.00';
                    const unit = entry.type === 'GNV' ? 'm³' : 'L';
                    return (
                        <Card key={entry.id} className="bg-secondary/50">
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`fuel-type-${index}`}>Tipo</Label>
                                        <Select value={entry.type} onValueChange={(value) => handleFuelChange(entry.id, 'type', value)}>
                                            <SelectTrigger id={`fuel-type-${index}`}>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fuelTypes.map((type) => (
                                                  <SelectItem key={type.name} value={type.name}>
                                                      <span>{type.name}</span>
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor={`fuel-paid-${index}`}>Valor Pago (R$)</Label>
                                        <Input
                                            id={`fuel-paid-${index}`} type="number" step="0.01" placeholder="Ex: 50.00"
                                            value={entry.paid || ''}
                                            onChange={(e) => handleFuelChange(entry.id, 'paid', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`fuel-price-${index}`}>Preço por {unit}</Label>
                                        <Input
                                            id={`fuel-price-${index}`} type="number" step="0.01" placeholder="Ex: 5.50"
                                            value={entry.price || ''}
                                            onChange={(e) => handleFuelChange(entry.id, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Total ({unit})</Label>
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                            {volume} {unit}
                                        </div>
                                    </div>
                                </div>
                                <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => handleRemoveFuelEntry(entry.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Remover Abastecimento
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })
            )}
             {!isPro && 
                <p className="text-xs text-muted-foreground pt-2">
                    Para adicionar novos tipos de combustível, <Link href="/premium" className="underline text-primary">faça um upgrade para o Pro</Link>.
                </p>
            }
        </CardContent>
      </Card>
      
      <Separator />

      {/* Seção de Despesas Extras */}
       <Card className="border-none shadow-none">
         <CardHeader className="p-0 pb-4 flex flex-row justify-between items-center">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-destructive"/>
                Despesas Extras
            </CardTitle>
            <Button size="sm" type="button" onClick={handleAddMaintenanceEntry} variant="destructive">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
             {data.maintenanceEntries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Clique em "Adicionar" se teve algum outro gasto.</p>
             ) : (
                data.maintenanceEntries.map((entry) => (
                    <Card key={entry.id} className="bg-secondary/50">
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={`maintenance-desc-${entry.id}`}>Descrição da Despesa</Label>
                                <Textarea 
                                    id={`maintenance-desc-${entry.id}`} placeholder="Ex: Troca de óleo, lavagem..."
                                    value={entry.description}
                                    onChange={(e) => handleMaintenanceChange(entry.id, 'description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`maintenance-amount-${entry.id}`}>Valor</Label>
                                <Input
                                    id={`maintenance-amount-${entry.id}`} type="number" step="0.01" placeholder="Ex: 120.50"
                                    value={entry.amount || ''}
                                    onChange={(e) => handleMaintenanceChange(entry.id, 'amount', e.target.value)}
                                />
                            </div>
                            <Button type="button" variant="destructive" size="sm" className="w-full" onClick={() => handleRemoveMaintenanceEntry(entry.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Remover Despesa
                            </Button>
                        </CardContent>
                    </Card>
                ))
             )}
        </CardContent>
       </Card>
    </div>
  );
}


"use client";

import { Dispatch, useCallback } from 'react';
import { PlusCircle, Trash2, Fuel, DollarSign, Wrench, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { FuelEntry, MaintenanceEntry, State } from './registration-wizard';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/contexts/auth-context';


type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };


interface Step3FuelProps {
  data: State;
  dispatch: Dispatch<Action>;
  fuelTypes: string[];
}

export function Step3Fuel({ data, dispatch, fuelTypes }: Step3FuelProps) {
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;

  const availableFuelTypes = isPremium ? fuelTypes : ["Combustível"];

  const handleFuelEntriesChange = useCallback((newEntries: FuelEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'fuelEntries', value: newEntries } });
  }, [dispatch]);

  const handleMaintenanceEntriesChange = useCallback((newEntries: MaintenanceEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'maintenanceEntries', value: newEntries } });
  }, [dispatch]);

  const handleAddFuelEntry = () => {
    const defaultFuelType = availableFuelTypes.length > 0 ? availableFuelTypes[0] : '';
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
        return { ...f, [field]: value };
      }
      return f;
    });
    handleFuelEntriesChange(updatedEntries);
  };
  
  const handleMaintenanceChange = (id: number, field: keyof Omit<MaintenanceEntry, 'id'>, value: string | number) => {
      const updatedEntries = data.maintenanceEntries.map((m) => {
          if (m.id === id) {
              if(field === 'amount') {
                   const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
                   return { ...m, [field]: isNaN(numValue) ? 0 : numValue };
              }
              return { ...m, [field]: value };
          }
          return m;
      });
      handleMaintenanceEntriesChange(updatedEntries);
  };


  return (
    <div className="space-y-6">
      {/* Seção de Abastecimentos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
                <Fuel className="h-6 w-6 text-red-600"/>
                <span>Abastecimentos</span>
            </h2>
            <Button size="sm" type="button" onClick={handleAddFuelEntry} variant="outline" disabled={availableFuelTypes.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
        </div>

        {!isPremium && (
             <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                    <p className="text-sm font-semibold text-primary">
                        <Lock className="inline-block h-4 w-4 mr-2"/>
                       Assine o Premium para categorizar combustíveis (GNV, Etanol) e otimizar sua eficiência.
                    </p>
                </CardContent>
            </Card>
        )}
        
        {availableFuelTypes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum tipo de combustível ativo. Adicione ou ative um em Configurações &gt; Gerenciar Catálogos.</p>
        ) : data.fuelEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Clique em "Adicionar" se abasteceu hoje.</p>
        )}

        <div className="space-y-4">
            {data.fuelEntries.map((entry, index) => {
            const volume = (entry.price > 0 && entry.paid > 0) ? (Number(entry.paid) / Number(entry.price)).toFixed(2) : '0.00';
            const unit = entry.type === 'GNV' ? 'm³' : 'L';

            return (
                <Card key={entry.id} className="bg-secondary/50">
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`fuel-type-${index}`}>Tipo de Combustível</Label>
                        <Select
                        value={entry.type}
                        onValueChange={(value) => handleFuelChange(entry.id, 'type', value)}
                        disabled={!isPremium}
                        >
                        <SelectTrigger id={`fuel-type-${index}`}>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableFuelTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor={`fuel-paid-${index}`}>Valor Pago</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                            <Input
                            id={`fuel-paid-${index}`}
                            type="number"
                            step="0.01"
                            placeholder="Ex: 50.00"
                            value={entry.paid || ''}
                            onChange={(e) => handleFuelChange(entry.id, 'paid', e.target.value)}
                            className="pl-10"
                            />
                        </div>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor={`fuel-price-${index}`}>Preço por {unit}</Label>
                            <div className="relative">
                                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                id={`fuel-price-${index}`}
                                type="number"
                                step="0.01"
                                placeholder="Ex: 5.50"
                                value={entry.price || ''}
                                onChange={(e) => handleFuelChange(entry.id, 'price', e.target.value)}
                                className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Total ({unit})</Label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                {volume} {unit}
                            </div>
                        </div>
                    </div>
                    <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRemoveFuelEntry(entry.id)}
                    >
                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                    </Button>
                </CardContent>
                </Card>
            );
            })}
        </div>
      </div>
      
      <Separator />

      {/* Seção de Despesas Extras */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
                <Wrench className="h-6 w-6 text-amber-500"/>
                <span>Despesas Extras</span>
            </h2>
            <Button size="sm" type="button" onClick={handleAddMaintenanceEntry} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
            </Button>
        </div>

        {data.maintenanceEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Clique em "Adicionar Despesa" se teve algum outro gasto.</p>
        )}

        <div className="space-y-4">
            {data.maintenanceEntries.map((entry) => (
                <Card key={entry.id} className="bg-secondary/50">
                    <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`maintenance-desc-${entry.id}`}>Descrição da Despesa</Label>
                            <Textarea 
                                id={`maintenance-desc-${entry.id}`}
                                placeholder="Ex: Troca de óleo, lavagem..."
                                value={entry.description}
                                onChange={(e) => handleMaintenanceChange(entry.id, 'description', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`maintenance-amount-${entry.id}`}>Valor</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                                <Input
                                    id={`maintenance-amount-${entry.id}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="Ex: 120.50"
                                    value={entry.amount || ''}
                                    onChange={(e) => handleMaintenanceChange(entry.id, 'amount', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemoveMaintenanceEntry(entry.id)}
                            >
                            <Trash2 className="mr-2 h-4 w-4" /> Remover Despesa
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

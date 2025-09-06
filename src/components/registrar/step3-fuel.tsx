

"use client";

import { Dispatch, useCallback } from 'react';
import { PlusCircle, Trash2, Fuel, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { FuelEntry, State } from './registration-wizard';

type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };


interface Step3FuelProps {
  data: State;
  dispatch: Dispatch<Action>;
}

const fuelTypes = ['Etanol', 'Gasolina Aditivada', 'GNV'];

export function Step3Fuel({ data, dispatch }: Step3FuelProps) {

  const handleFuelEntriesChange = useCallback((newEntries: FuelEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'fuelEntries', value: newEntries } });
  }, [dispatch]);

  const handleAddFuelEntry = () => {
    const newEntry: FuelEntry = { id: Date.now(), type: '', paid: 0, price: 0 };
    handleFuelEntriesChange([...data.fuelEntries, newEntry]);
  };

  const handleRemoveFuelEntry = (id: number) => {
    handleFuelEntriesChange(data.fuelEntries.filter((f) => f.id !== id));
  };

  const handleFuelChange = (id: number, field: keyof Omit<FuelEntry, 'id'>, value: string | number) => {
    const updatedEntries = data.fuelEntries.map((f) => {
      if (f.id === id) {
        const parsedValue = (field === 'paid' || field === 'price') ? (parseFloat(String(value).replace(',', '.')) || 0) : value;
        return { ...f, [field]: parsedValue };
      }
      return f;
    });
    handleFuelEntriesChange(updatedEntries);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
            <Fuel className="h-6 w-6 text-red-600"/>
            <span>Abastecimentos</span>
        </h2>
        <Button size="sm" type="button" onClick={handleAddFuelEntry} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      {data.fuelEntries.length === 0 && (
        <p className="text-muted-foreground text-center py-4">Clique em "Adicionar" se abasteceu hoje.</p>
      )}

      <div className="space-y-4">
        {data.fuelEntries.map((entry, index) => {
          const volume = entry.price > 0 ? (entry.paid / entry.price).toFixed(2) : '0.00';
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
                    >
                      <SelectTrigger id={`fuel-type-${index}`}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`fuel-paid-${index}`}>Valor Pago</Label>                     <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
                        <Input
                          id={`fuel-paid-${index}`}
                          type="text"
                          inputMode="decimal"
                          placeholder="Ex: 50,00"
                          value={String(entry.paid || '').replace('.', ',')}
                          onChange={(e) => handleFuelChange(entry.id, 'paid', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`fuel-price-${index}`}>Preço por {unit}</Label>                        <div className="relative">
                            <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                            id={`fuel-price-${index}`}
                            type="text"
                            inputMode="decimal"
                            placeholder="Ex: 5,50"
                            value={String(entry.price || '').replace('.', ',')}
                            onChange={(e) => handleFuelChange(entry.id, 'price', e.target.value)}
                            className="pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Total ({unit})</Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                            {volume.replace('.', ',')} {unit}
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
  );
}

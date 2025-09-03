
"use client";

import { Dispatch } from 'react';
import { PlusCircle, Trash2, Car, DollarSign, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { Earning } from './registration-wizard';

type Action = { type: 'SET_EARNINGS'; payload: Earning[] };
type State = { earnings: Earning[] };

interface Step2EarningsProps {
  data: State;
  dispatch: Dispatch<Action>;
}

const categories = ['Uber X', '99 Pop', 'Particular', 'Ganhos Extras'];

export function Step2Earnings({ data, dispatch }: Step2EarningsProps) {
  const handleAddEarning = () => {
    const newEarning: Earning = { id: Date.now(), category: '', trips: 0, amount: 0 };
    dispatch({ type: 'SET_EARNINGS', payload: [...data.earnings, newEarning] });
  };

  const handleRemoveEarning = (id: number) => {
    dispatch({ type: 'SET_EARNINGS', payload: data.earnings.filter((e) => e.id !== id) });
  };

  const handleEarningChange = (id: number, field: keyof Omit<Earning, 'id'>, value: string | number) => {
    const updatedEarnings = data.earnings.map((e) => {
      if (e.id === id) {
        return { ...e, [field]: value };
      }
      return e;
    });
    dispatch({ type: 'SET_EARNINGS', payload: updatedEarnings });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-green-600"/>
            <span>Ganhos do Dia</span>
        </h2>
        <Button size="sm" onClick={handleAddEarning}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ganho
        </Button>
      </div>

      {data.earnings.length === 0 && (
        <p className="text-muted-foreground text-center py-4">Clique em "Adicionar Ganho" para começar.</p>
      )}

      <div className="space-y-4">
        {data.earnings.map((earning, index) => (
          <Card key={earning.id} className="bg-secondary/50">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`category-${index}`}>Categoria</Label>
                  <Select
                    value={earning.category}
                    onValueChange={(value) => handleEarningChange(earning.id, 'category', value)}
                  >
                    <SelectTrigger id={`category-${index}`}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`trips-${index}`}>Nº de Viagens</Label>                   <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      id={`trips-${index}`}
                      type="number"
                      placeholder="Ex: 10"
                      value={earning.trips || ''}
                      onChange={(e) => handleEarningChange(earning.id, 'trips', parseInt(e.target.value) || 0)}
                      disabled={earning.category === 'Ganhos Extras'}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor={`amount-${index}`}>Valor Ganho</Label>                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      placeholder="Ex: 150.50"
                      value={earning.amount || ''}
                      onChange={(e) => handleEarningChange(earning.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => handleRemoveEarning(earning.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remover
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

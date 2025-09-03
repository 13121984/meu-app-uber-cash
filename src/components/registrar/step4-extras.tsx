"use client";

import { Dispatch } from 'react';
import { DollarSign, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Action = { type: 'SET_MAINTENANCE'; payload: { description: string; amount: number } };
type State = { maintenance: { description: string; amount: number } };

interface Step4ExtrasProps {
  data: State;
  dispatch: Dispatch<Action>;
}

export function Step4Extras({ data, dispatch }: Step4ExtrasProps) {
  const handleChange = (field: 'description' | 'amount', value: string | number) => {
    dispatch({
      type: 'SET_MAINTENANCE',
      payload: { ...data.maintenance, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Manutenção ou Despesas Extras</h2>
      <p className="text-muted-foreground">Adicione qualquer despesa extra do dia, como lavagem ou troca de óleo.</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Descrição</Label>
           <div className="relative">
            <Wrench className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Textarea
              id="description"
              placeholder="Ex: Troca de óleo"
              value={data.maintenance.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 120.00"
              value={data.maintenance.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { Dispatch } from 'react';
import { DollarSign, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

type Action = { type: 'SET_MAINTENANCE'; payload: { description: string; amount: number } };
type State = { maintenance: { description: string; amount: number } };

interface Step4ExtrasProps {
  data: State;
  dispatch: Dispatch<Action>;
  isDisabled?: boolean;
}

export function Step4Extras({ data, dispatch, isDisabled = false }: Step4ExtrasProps) {
  const handleChange = (field: 'description' | 'amount', value: string | number) => {
    dispatch({
      type: 'SET_MAINTENANCE',
      payload: { ...data.maintenance, [field]: value },
    });
  };

  if (isDisabled) {
    return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Edição de Manutenção</AlertTitle>
            <AlertDescription>
                Para editar despesas de manutenção, por favor, use a página de <a href="/manutencao" className="font-bold underline">Manutenção</a>.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
        <Wrench className="h-6 w-6 text-amber-500" />
        <span>Manutenção ou Despesas Extras</span>
        </h2>
      <p className="text-muted-foreground">Adicione qualquer despesa extra do dia. Esta despesa será salva como um registro de manutenção separado.</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Descrição</Label>           <div className="relative">
            <Wrench className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Textarea
              id="description"
              placeholder="Ex: Troca de óleo"
              value={data.maintenance.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="pl-10"
              disabled={isDisabled}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600" />
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 120.00"
              value={data.maintenance.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              className="pl-10"
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

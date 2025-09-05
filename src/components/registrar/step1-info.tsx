
"use client";

import { Dispatch } from 'react';
import { CalendarIcon, Clock, Milestone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Action = { type: 'SET_BASIC_INFO'; payload: { date: Date; km: number; hours: number } };
type State = { date: Date; km: number; hours: number };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
}

export function Step1Info({ data, dispatch }: Step1InfoProps) {
  const handleChange = (field: 'km' | 'hours', value: string) => {
    const numValue = parseFloat(value) || 0;
    dispatch({
      type: 'SET_BASIC_INFO',
      payload: { ...data, [field]: numValue },
    });
  };

  const handleDateChange = (date?: Date) => {
    if (date) {
      dispatch({
        type: 'SET_BASIC_INFO',
        payload: { ...data, date },
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Data do Trabalho</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'secondary'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !data.date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {data.date ? format(data.date, "EEEE, dd 'de' MMMM", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={data.date} onSelect={handleDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="km">KM Rodados</Label>
          <div className="relative">
            <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              id="km"
              type="number"
              placeholder="Ex: 150"
              value={data.km || ''}
              onChange={(e) => handleChange('km', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="hours">Horas Trabalhadas</Label>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input
              id="hours"
              type="number"
              placeholder="Ex: 8.5"
              value={data.hours || ''}
              onChange={(e) => handleChange('hours', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

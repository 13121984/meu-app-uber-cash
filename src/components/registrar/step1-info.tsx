
"use client";

import { Dispatch, useState } from 'react';
import { CalendarIcon, Clock, Milestone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Action = { type: 'SET_BASIC_INFO'; payload: { date: Date; km: number; hours: number } };
type State = { date: Date; km: number; hours: number };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
}

export function Step1Info({ data, dispatch }: Step1InfoProps) {
  // O estado do input agora reflete o que o usuário está digitando
  // e é inicializado com a data formatada do estado principal.
  const [dateInputValue, setDateInputValue] = useState(format(data.date, "dd/MM/yyyy"));

  const handleChange = (field: 'km' | 'hours', value: string) => {
    const numValue = parseFloat(value) || 0;
    dispatch({
      type: 'SET_BASIC_INFO',
      payload: { ...data, [field]: numValue },
    });
  };

  // Esta função é chamada quando uma data é selecionada no calendário.
  const handleDateSelect = (date?: Date) => {
    if (date) {
      dispatch({
        type: 'SET_BASIC_INFO',
        payload: { ...data, date },
      });
      // Atualiza o campo de input para refletir a seleção do calendário.
      setDateInputValue(format(date, "dd/MM/yyyy"));
    }
  };

  // Esta função agora lida com a digitação livre no campo de data.
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value); // Permite que o usuário digite livremente.

    // Tenta validar e atualizar o estado principal apenas quando a data parece completa.
    if (value.length >= 8) { // Ex: 1/1/2023 ou 01/01/2023
      try {
        // Tenta fazer o parse da data. 'dd/MM/yyyy' é flexível o suficiente.
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        // Verifica se o parse resultou em uma data válida.
        if (!isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900) {
           dispatch({
              type: 'SET_BASIC_INFO',
              payload: { ...data, date: parsedDate },
           });
        }
      } catch (error) {
        // Ignora erros de parsing enquanto o usuário ainda está digitando.
      }
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
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  id="date"
                  value={dateInputValue}
                  onChange={handleDateInputChange}
                  placeholder="dd/mm/aaaa"
                  className="pl-10"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data.date}
                onSelect={handleDateSelect}
                initialFocus
              />
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


"use client";

import React, { Dispatch } from 'react';
import { CalendarIcon, Clock, Milestone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { State } from './registration-wizard';

type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
  registrationType: 'today' | 'other-day';
  isEditing?: boolean;
}

export function Step1Info({ data, dispatch, registrationType, isEditing }: Step1InfoProps) {
  
  const handleFieldChange = (field: keyof State, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };
  
  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const hours = value === '' ? 0 : parseFloat(value.replace(',', '.')) || 0;
    handleFieldChange('hours', hours);
  }

  const isDateDisabled = registrationType === 'today' && !isEditing;
  const dateString = data.date && isValid(data.date) ? format(data.date, 'dd/MM/yyyy') : '';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Data do Trabalho</Label>
           <div className="flex items-center gap-2">
            <Input id="date" type="text" placeholder="DD/MM/AAAA" value={dateString} disabled={isDateDisabled} readOnly />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" disabled={isDateDisabled}>
                  <CalendarIcon className="h-4 w-4 text-primary" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={data.date} onSelect={(d) => d && handleFieldChange('date', d)} initialFocus locale={ptBR} disabled={(date) => date > new Date() || isDateDisabled}/>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label htmlFor="km">KM Rodados</Label>
          <div className="relative">
            <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input id="km" type="number" placeholder="Ex: 150" value={data.km || ''} onChange={(e) => handleFieldChange('km', parseFloat(e.target.value) || 0)} className="pl-10"/>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hours">Total de Horas</Label>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input id="hours" type="text" placeholder="Ex: 8,5" value={data.hours ? data.hours.toString().replace('.', ',') : ''} onChange={handleHoursInputChange} className="pl-10"/>
          </div>
        </div>
      </div>
    </div>
  );
}

    

"use client";

import React, { Dispatch, useCallback } from 'react';
import { CalendarIcon, Clock, Milestone, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid, parse, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';
import { State } from './registration-wizard';

export type TimeEntry = {
    id: number;
    start: string;
    end: string;
};

type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
  registrationType: 'today' | 'other-day';
  isEditing?: boolean;
}

const getTurno = (startTime: string): string => {    
    if (!startTime) return '—';
    const [hour] = startTime.split(':').map(Number);
    if (hour >= 6 && hour < 12) return 'Manhã';
    if (hour >= 12 && hour < 18) return 'Tarde';
    if (hour >= 18 && hour <= 23) return 'Noite';
    return 'Madrugada';
};

const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((acc, entry) => {
        if (!entry.start || !entry.end) return acc;
        try {
            const start = parse(entry.start, 'HH:mm', new Date());
            const end = parse(entry.end, 'HH:mm', new Date());
            if (isValid(start) && isValid(end)) {
                let diff = end.getTime() - start.getTime();
                if (diff < 0) { // Handles overnight shifts
                    diff += 24 * 60 * 60 * 1000;
                }
                const hours = diff / (1000 * 60 * 60);
                return acc + hours;
            }
        } catch {
            return acc;
        }
        return acc;
    }, 0);
};

export function Step1Info({ data, dispatch, registrationType, isEditing }: Step1InfoProps) {

  const handleFieldChange = useCallback((field: keyof State, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  }, [dispatch]);

  const handleTimeEntryChange = (id: number, field: 'start' | 'end', value: string) => {
      const updatedEntries = data.timeEntries.map(entry =>
          entry.id === id ? { ...entry, [field]: value } : entry
      );
      const totalHours = calculateTotalHours(updatedEntries);
      handleFieldChange('timeEntries', updatedEntries);
      handleFieldChange('hours', totalHours);
  };

  const addTimeEntry = () => {
      const newEntry: TimeEntry = { id: Date.now(), start: '', end: '' };
      const updatedEntries = [...data.timeEntries, newEntry];
      handleFieldChange('timeEntries', updatedEntries);
  };

  const removeTimeEntry = (id: number) => {
      const updatedEntries = data.timeEntries.filter(entry => entry.id !== id);
      const totalHours = calculateTotalHours(updatedEntries);
      handleFieldChange('timeEntries', updatedEntries);
      handleFieldChange('hours', totalHours);
  };
  
  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string to clear the field, parse to float otherwise
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

        <div className="space-y-2">
          <Label>Horas Trabalhadas</Label>
          <div className="space-y-4 rounded-md border p-4">
            <ScrollArea className="max-h-[250px] w-full pr-4">
                <div className="space-y-4">
                    {data.timeEntries.map(entry => (
                        <div key={entry.id} className="flex flex-col sm:flex-row items-center gap-2">
                            <Input type="time" value={entry.start} onChange={e => handleTimeEntryChange(entry.id, 'start', e.target.value)} aria-label="Hora de início"/>
                            <span className="text-muted-foreground">-</span>
                            <Input type="time" value={entry.end} onChange={e => handleTimeEntryChange(entry.id, 'end', e.target.value)} aria-label="Hora de término"/>
                            <span className="text-sm font-medium p-2 bg-muted rounded-md w-full sm:w-auto text-center">{getTurno(entry.start)}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeTimeEntry(entry.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
             <Button type="button" variant="outline" size="sm" onClick={addTimeEntry} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Período
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hours">Total de Horas (Calculado ou Manual)</Label>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input id="hours" type="text" placeholder="Ex: 8,5" value={data.hours ? data.hours.toFixed(2).replace('.', ',') : ''} onChange={handleHoursInputChange} className="pl-10" disabled={data.timeEntries.length > 0}/>
          </div>
        </div>
      </div>
    </div>
  );
}

    
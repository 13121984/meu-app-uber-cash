
"use client";

import React, { Dispatch, useCallback, useMemo } from 'react';
import { CalendarIcon, Clock, Milestone, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { State, TimeEntry } from './registration-wizard';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

type Action = { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
  registrationType: 'today' | 'other-day';
  isEditing?: boolean;
}

const timeToMinutes = (time: string): number => {
    if(!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export function Step1Info({ data, dispatch, registrationType, isEditing }: Step1InfoProps) {
  
  const handleFieldChange = (field: keyof State, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };
  
  const handleTimeEntriesChange = useCallback((newTimeEntries: TimeEntry[]) => {
      let totalMinutes = 0;
      newTimeEntries.forEach(entry => {
          const startMinutes = timeToMinutes(entry.start);
          const endMinutes = timeToMinutes(entry.end);
          if(endMinutes > startMinutes) {
              totalMinutes += endMinutes - startMinutes;
          }
      });
      const totalHours = totalMinutes / 60;
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'timeEntries', value: newTimeEntries }});
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'hours', value: totalHours } });
  }, [dispatch]);

  const addTimeEntry = () => {
      const newEntry = { id: Date.now(), start: '', end: '' };
      handleTimeEntriesChange([...data.timeEntries, newEntry]);
  };

  const removeTimeEntry = (id: number) => {
      handleTimeEntriesChange(data.timeEntries.filter(entry => entry.id !== id));
  };
  
  const updateTimeEntry = (id: number, field: 'start' | 'end', value: string) => {
      const updated = data.timeEntries.map(entry => entry.id === id ? { ...entry, [field]: value } : entry);
      handleTimeEntriesChange(updated);
  };
  
  const isDateDisabled = registrationType === 'today' && !isEditing;
  const dateString = data.date && isValid(data.date) ? format(data.date, 'dd/MM/yyyy') : '';
  const hasTimeEntries = useMemo(() => data.timeEntries && data.timeEntries.length > 0, [data.timeEntries]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Data do Trabalho</Label>
           <div className="flex items-center gap-2">
            <Input id="date" type="text" placeholder="DD/MM/AAAA" value={dateString} disabled readOnly />
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
            <Input id="km" type="number" placeholder="Ex: 150" value={data.km === 0 ? '' : data.km} onChange={(e) => handleFieldChange('km', parseFloat(e.target.value) || 0)} className="pl-10"/>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hours">Total de Horas</Label>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input 
                id="hours" 
                type="text" 
                placeholder="Ex: 8,5" 
                value={data.hours ? data.hours.toString().replace('.', ',') : ''} 
                onChange={(e) => handleFieldChange('hours', parseFloat(e.target.value.replace(',', '.')) || 0)} 
                className="pl-10" 
                disabled={hasTimeEntries}
            />
            {hasTimeEntries && <p className="text-xs text-muted-foreground mt-1">O total de horas é calculado automaticamente a partir dos períodos.</p>}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                 <Label>Períodos de Trabalho</Label>
                 <Button type="button" size="sm" variant="outline" onClick={addTimeEntry}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Período
                 </Button>
            </div>
            <ScrollArea className="max-h-[250px] w-full pr-4">
                <div className="space-y-2">
                {data.timeEntries.map((entry) => (
                    <Card key={entry.id} className="p-2 bg-secondary/50">
                        <CardContent className="p-1 flex items-center gap-2">
                            <Input type="time" value={entry.start} onChange={(e) => updateTimeEntry(entry.id, 'start', e.target.value)} />
                            <span>às</span>
                            <Input type="time" value={entry.end} onChange={(e) => updateTimeEntry(entry.id, 'end', e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeTimeEntry(entry.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}



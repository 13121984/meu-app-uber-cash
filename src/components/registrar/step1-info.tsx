

"use client";

import React, { Dispatch, useCallback, useMemo, useState } from 'react';
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
  isEditing?: boolean;
  registrationType: 'today' | 'other-day';
}

const timeToMinutes = (time: string): number => {
    if(!time || !time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// This function now only calculates and dispatches the new hours total
const calculateAndDispatchHours = (timeEntries: TimeEntry[], dispatch: Dispatch<Action>) => {
    let totalMinutes = 0;
    timeEntries.forEach(entry => {
        const startMinutes = timeToMinutes(entry.start);
        const endMinutes = timeToMinutes(entry.end);
        if(endMinutes > startMinutes) {
            totalMinutes += endMinutes - startMinutes;
        }
    });
    const totalHours = totalMinutes / 60;
    dispatch({ type: 'UPDATE_FIELD', payload: { field: 'hours', value: totalHours }});
};

export function Step1Info({ data, dispatch, isEditing, registrationType }: Step1InfoProps) {
  
  // Local state for inputs to allow flexible user typing (e.g., "8,")
  const [kmInput, setKmInput] = useState(data.km > 0 ? String(data.km).replace('.', ',') : '');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  
  const handleFieldChange = (field: keyof State, value: any) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };
  
  const handleNumericInputChange = (field: 'km', rawValue: string) => {
    // Allow user to type comma or dot
    const sanitizedValue = rawValue.replace(/[^0-9,.]/g, '');
    
    if (field === 'km') setKmInput(sanitizedValue);
    
    // Convert to number for state update
    const numericValue = parseFloat(sanitizedValue.replace(',', '.')) || 0;
    handleFieldChange(field, numericValue);
  }

  const handleTimePickerChange = (timeValue: string) => {
      const totalMinutes = timeToMinutes(timeValue);
      const decimalHours = totalMinutes / 60;
      handleFieldChange('hours', decimalHours);
      setIsTimePickerOpen(false);
  }
  
  const handleTimeEntriesChange = useCallback((newTimeEntries: TimeEntry[]) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field: 'timeEntries', value: newTimeEntries }});
      calculateAndDispatchHours(newTimeEntries, dispatch);
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Data do Trabalho</Label>
            <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                        variant="outline" 
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !data.date && "text-muted-foreground"
                        )}
                        disabled={isDateDisabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {dateString ? dateString : <span>Selecione uma data</span>}
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
            <Input
              id="km"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 150,5"
              value={kmInput}
              onChange={(e) => handleNumericInputChange('km', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
           <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="hours">Total de Horas</Label>
                <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={hasTimeEntries}>
                            <Clock className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                     <PopoverContent className="w-auto p-2">
                        <Label className="text-xs text-muted-foreground px-1">Definir Horas (HH:MM)</Label>
                        <Input 
                            type="time" 
                            onChange={(e) => handleTimePickerChange(e.target.value)}
                        />
                    </PopoverContent>
                </Popover>
           </div>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input
              id="hours"
              type="text"
              readOnly
              placeholder="0,0"
              value={data.hours > 0 ? String(data.hours.toFixed(2)).replace('.', ',') : '0,0'}
              className="pl-10 bg-muted/70 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-not-allowed"
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

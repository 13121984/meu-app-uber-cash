

"use client";

import React, { Dispatch, useCallback, useMemo, useState, useEffect } from 'react';
import { CalendarIcon, Clock, Milestone, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid, setDate, setMonth, setYear, getDate, getMonth, getYear } from 'date-fns';
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
  
  const [kmInput, setKmInput] = useState(data.km > 0 ? String(data.km).replace('.', ',') : '');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  // State for individual date fields
  const [day, setDay] = useState(data.date ? getDate(data.date).toString() : '');
  const [month, setMonth] = useState(data.date ? (getMonth(data.date) + 1).toString() : '');
  const [year, setYearState] = useState(data.date ? getYear(data.date).toString() : '');
  
  // Update local date fields when data.date changes from parent
  useEffect(() => {
    if (data.date && isValid(data.date)) {
        setDay(getDate(data.date).toString());
        setMonth((getMonth(data.date) + 1).toString());
        setYearState(getYear(data.date).toString());
    }
  }, [data.date]);

  const handleFieldChange = (field: keyof State, value: any) => {
      dispatch({ type: 'UPDATE_FIELD', payload: { field, value } });
  };

  const handleDateChange = (part: 'day' | 'month' | 'year', value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    let newDay = part === 'day' ? numericValue : day;
    let newMonth = part === 'month' ? numericValue : month;
    let newYear = part === 'year' ? numericValue : year;

    if (part === 'day') setDay(newDay);
    if (part === 'month') setMonth(newMonth);
    if (part === 'year') setYearState(newYear);

    const dayInt = parseInt(newDay, 10);
    const monthInt = parseInt(newMonth, 10) - 1; // month is 0-indexed
    const yearInt = parseInt(newYear, 10);

    if (!isNaN(dayInt) && !isNaN(monthInt) && !isNaN(yearInt) && newYear.length === 4) {
      const newDate = new Date(yearInt, monthInt, dayInt);
      if (isValid(newDate)) {
        handleFieldChange('date', newDate);
      }
    }
  };
  
  const handleNumericInputChange = (field: 'km', rawValue: string) => {
    const sanitizedValue = rawValue.replace(/[^0-9,.]/g, '');
    if (field === 'km') setKmInput(sanitizedValue);
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
  const hasTimeEntries = useMemo(() => data.timeEntries && data.timeEntries.length > 0, [data.timeEntries]);
  

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Data do Trabalho</Label>
           <div className="grid grid-cols-3 gap-2">
            <Input 
                placeholder="Dia" 
                value={day} 
                onChange={(e) => handleDateChange('day', e.target.value)} 
                maxLength={2}
                disabled={isDateDisabled}
                inputMode="numeric"
            />
            <Input 
                placeholder="Mês" 
                value={month} 
                onChange={(e) => handleDateChange('month', e.target.value)} 
                maxLength={2}
                disabled={isDateDisabled}
                inputMode="numeric"
            />
            <Input 
                placeholder="Ano" 
                value={year} 
                onChange={(e) => handleDateChange('year', e.target.value)} 
                maxLength={4}
                disabled={isDateDisabled}
                inputMode="numeric"
            />
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
            <Label>Total de Horas</Label>
            <div className="relative">
                <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
                    <PopoverTrigger asChild disabled={hasTimeEntries}>
                         <div className="relative">
                             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 pointer-events-none" />
                             <Input
                                id="hours"
                                type="text"
                                readOnly
                                value={data.hours > 0 ? String(data.hours.toFixed(2)).replace('.', ',') : '0,00'}
                                className={cn(
                                    "pl-10 bg-muted/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                                    !hasTimeEntries ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                )}
                             />
                         </div>
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
             <p className="text-xs text-muted-foreground mt-1">O total de horas é convertido para decimal para os cálculos.</p>
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




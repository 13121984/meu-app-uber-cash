
"use client";

import React, { Dispatch, useCallback, useMemo, useState, useEffect } from 'react';
import { CalendarIcon, Clock, Milestone, PlusCircle, Trash2, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid, setDate, setMonth, setYear, getDate, getMonth, getYear } from 'date-fns';
import { State, TimeEntry } from './registration-wizard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  
  const [day, setDay] = useState(data.date ? getDate(data.date).toString() : '');
  const [month, setMonth] = useState(data.date ? (getMonth(data.date) + 1).toString() : '');
  const [year, setYearState] = useState(data.date ? getYear(data.date).toString() : '');
  
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
    const monthInt = parseInt(newMonth, 10) - 1;
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

  return (
    <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-primary"/>
                Dados Básicos da Viagem
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
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
                <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="km" type="text" inputMode="decimal" placeholder="Ex: 150,5"
                  value={kmInput}
                  onChange={(e) => handleNumericInputChange('km', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Separator/>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                     <Label>Períodos de Trabalho</Label>
                     <Button type="button" size="sm" variant="outline" onClick={addTimeEntry}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                     </Button>
                </div>
                 <p className="text-xs text-muted-foreground">Adicione os horários em que trabalhou para calcular o total de horas automaticamente.</p>
                <ScrollArea className="max-h-[200px] w-full pr-4">
                    <div className="space-y-2">
                    {data.timeEntries.length > 0 ? data.timeEntries.map((entry) => (
                        <div key={entry.id} className="p-2 bg-secondary/50 rounded-md">
                            <div className="flex items-center gap-2">
                                <Input type="time" value={entry.start} onChange={(e) => updateTimeEntry(entry.id, 'start', e.target.value)} />
                                <span>às</span>
                                <Input type="time" value={entry.end} onChange={(e) => updateTimeEntry(entry.id, 'end', e.target.value)} />
                                <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeTimeEntry(entry.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-center py-4 text-muted-foreground">Nenhum período adicionado.</p>
                    )}
                    </div>
                </ScrollArea>
                 <div className="pt-2">
                    <Label>Total de Horas</Label>
                     <div className="relative">
                         <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                         <Input
                            id="hours" type="text" readOnly
                            value={`${data.hours.toFixed(2).replace('.',',')}h`}
                            className="pl-10 bg-muted/70 cursor-not-allowed"
                         />
                     </div>
                 </div>
            </div>
      </CardContent>
    </Card>
  );
}

    
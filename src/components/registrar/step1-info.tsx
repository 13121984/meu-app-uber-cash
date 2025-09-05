
"use client";

import { Dispatch, useState, useEffect } from 'react';
import { CalendarIcon, Clock, Milestone, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TimeEntry = {
    id: number;
    start: string;
    end: string;
};

type Action = { type: 'SET_BASIC_INFO'; payload: { date: Date; km: number; hours: number; timeEntries: TimeEntry[] } };
type State = { date: Date; km: number; hours: number; timeEntries: TimeEntry[] };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
  registrationType: 'today' | 'other-day';
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
                return acc + diff / (1000 * 60 * 60);
            }
        } catch {
            return acc;
        }
        return acc;
    }, 0);
};

export function Step1Info({ data, dispatch, registrationType }: Step1InfoProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYearState] = useState('');
  const [manualHours, setManualHours] = useState(data.hours || '');

  useEffect(() => {
    if (data.date && isValid(data.date)) {
      setDay(format(data.date, 'dd'));
      setMonth(format(data.date, 'MM'));
      setYearState(format(data.date, 'yyyy'));
    }
  }, [data.date]);

  useEffect(() => {
    if (data.timeEntries.length > 0) {
      const totalHours = calculateTotalHours(data.timeEntries);
      dispatch({
        type: 'SET_BASIC_INFO',
        payload: { ...data, hours: totalHours },
      });
      setManualHours(totalHours.toFixed(2));
    } else {
        const numValue = parseFloat(manualHours.toString()) || 0;
        dispatch({
            type: 'SET_BASIC_INFO',
            payload: { ...data, hours: numValue },
        });
    }
  }, [data.timeEntries, manualHours]);


  const updateMainDate = (newDay: number, newMonth: number, newYear: number) => {
    const updatedDate = new Date(newYear, newMonth - 1, newDay);
    if (isValid(updatedDate) && updatedDate.getFullYear() === newYear && (updatedDate.getMonth() + 1) === newMonth && updatedDate.getDate() === newDay) {
      dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, date: updatedDate } });
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 2);
    setDay(value);
    const dayNum = parseInt(value, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
      updateMainDate(dayNum, monthNum, yearNum);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 2);
    setMonth(value);
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(value, 10);
    const yearNum = parseInt(year, 10);
     if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
      updateMainDate(dayNum, monthNum, yearNum);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 4);
    setYearState(value);
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(value, 10);
    if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum) && value.length === 4) {
      updateMainDate(dayNum, monthNum, yearNum);
    }
  };
  
  const handleDateSelect = (selectedDate?: Date) => {
    if (selectedDate && isValid(selectedDate)) {
        dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, date: selectedDate } });
    }
  };

  const handleKmChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, km: numValue } });
  };
  
  const handleTimeEntryChange = (id: number, field: 'start' | 'end', value: string) => {
      const updatedEntries = data.timeEntries.map(entry =>
          entry.id === id ? { ...entry, [field]: value } : entry
      );
      dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, timeEntries: updatedEntries } });
  };

  const addTimeEntry = () => {
      const newEntry: TimeEntry = { id: Date.now(), start: '', end: '' };
      dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, timeEntries: [...data.timeEntries, newEntry] } });
  };

  const removeTimeEntry = (id: number) => {
      const updatedEntries = data.timeEntries.filter(entry => entry.id !== id);
      dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, timeEntries: updatedEntries } });
  };

  const isDateDisabled = registrationType === 'today';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date-day">Data do Trabalho</Label>
          <div className="flex items-center gap-2">
            <Input id="date-day" type="number" placeholder="DD" value={day} onChange={handleDayChange} className="w-16 text-center" disabled={isDateDisabled}/>
            <Input id="date-month" type="number" placeholder="MM" value={month} onChange={handleMonthChange} className="w-16 text-center" disabled={isDateDisabled}/>
            <Input id="date-year" type="number" placeholder="AAAA" value={year} onChange={handleYearChange} className="w-24 text-center" disabled={isDateDisabled}/>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isDateDisabled}>
                        <CalendarIcon className="h-4 w-4 text-primary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={data.date} onSelect={handleDateSelect} initialFocus locale={ptBR} disabled={isDateDisabled}/>
                </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label htmlFor="km">KM Rodados</Label>
          <div className="relative">
            <Milestone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input id="km" type="number" placeholder="Ex: 150" value={data.km || ''} onChange={(e) => handleKmChange(e.target.value)} className="pl-10"/>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Horas Trabalhadas</Label>
          <div className="space-y-4 rounded-md border p-4">
            {data.timeEntries.map(entry => (
                <div key={entry.id} className="flex flex-col sm:flex-row items-center gap-2">
                    <Input type="time" value={entry.start} onChange={e => handleTimeEntryChange(entry.id, 'start', e.target.value)} aria-label="Hora de início"/>
                    <span className="text-muted-foreground">-</span>
                    <Input type="time" value={entry.end} onChange={e => handleTimeEntryChange(entry.id, 'end', e.target.value)} aria-label="Hora de término"/>
                    <span className="text-sm font-medium p-2 bg-muted rounded-md w-full sm:w-auto text-center">{getTurno(entry.start)}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeTimeEntry(entry.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={addTimeEntry} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Período
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="hours">Total de Horas (Calculado ou Manual)</Label>
           <div className="relative">
             <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <Input id="hours" type="number" placeholder="Ex: 8.5" value={manualHours} onChange={e => setManualHours(e.target.value)} className="pl-10"/>
          </div>
        </div>
      </div>
    </div>
  );
}

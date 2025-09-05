
"use client";

import { Dispatch, useState, useEffect } from 'react';
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
                return acc + diff / (1000 * 60 * 60);
            }
        } catch {
            return acc;
        }
        return acc;
    }, 0);
};

export function Step1Info({ data, dispatch, registrationType, isEditing }: Step1InfoProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYearState] = useState('');
  const [manualHours, setManualHours] = useState('');

  // Syncs the individual date inputs (day, month, year) with the main date object from the state
  useEffect(() => {
    if (data.date && isValid(data.date)) {
      setDay(format(data.date, 'dd'));
      setMonth(format(data.date, 'MM'));
      setYearState(format(data.date, 'yyyy'));
    }
  }, [data.date]);
  
  // Syncs the manual hours input with the state, primarily for when data is loaded
  useEffect(() => {
    if (data.hours > 0) {
      setManualHours(data.hours.toFixed(2));
    } else {
      setManualHours('');
    }
  }, [data.hours])

  // Recalculates total hours whenever time entries change or if manual input is cleared
  useEffect(() => {
    if (data.timeEntries.length > 0) {
      const totalHours = calculateTotalHours(data.timeEntries);
      dispatch({
        type: 'SET_BASIC_INFO',
        payload: { ...data, hours: totalHours },
      });
    } else {
        const numValue = parseFloat(manualHours.toString().replace(',', '.')) || 0;
        if (data.hours !== numValue) {
          dispatch({
              type: 'SET_BASIC_INFO',
              payload: { ...data, hours: numValue },
          });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.timeEntries, manualHours]);


  const updateMainDate = (newDate: Date) => {
    if (isValid(newDate)) {
      dispatch({ type: 'SET_BASIC_INFO', payload: { ...data, date: newDate } });
    }
  };

  const handleDatePartChange = (part: 'day' | 'month' | 'year', value: string) => {
    const currentDay = part === 'day' ? value : day;
    const currentMonth = part === 'month' ? value : month;
    const currentYear = part === 'year' ? value : year;

    if (part === 'day') setDay(value);
    if (part === 'month') setMonth(value);
    if (part === 'year') setYearState(value);

    if(currentDay.length === 2 && currentMonth.length === 2 && currentYear.length === 4) {
        const dayNum = parseInt(currentDay, 10);
        const monthNum = parseInt(currentMonth, 10);
        const yearNum = parseInt(currentYear, 10);
        const newDate = set(new Date(), { year: yearNum, month: monthNum -1, date: dayNum, hours:12 });
        updateMainDate(newDate);
    }
  };

  const handleKmChange = (value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
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

  const isDateDisabled = registrationType === 'today' && !isEditing;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date-day">Data do Trabalho</Label>
          <div className="flex items-center gap-2">
            <Input id="date-day" type="number" placeholder="DD" value={day} onChange={(e) => handleDatePartChange('day', e.target.value)} className="w-16 text-center" disabled={isDateDisabled}/>
            <Input id="date-month" type="number" placeholder="MM" value={month} onChange={(e) => handleDatePartChange('month', e.target.value)} className="w-16 text-center" disabled={isDateDisabled}/>
            <Input id="date-year" type="number" placeholder="AAAA" value={year} onChange={(e) => handleDatePartChange('year', e.target.value)} className="w-24 text-center" disabled={isDateDisabled}/>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isDateDisabled}>
                        <CalendarIcon className="h-4 w-4 text-primary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={data.date} onSelect={(d) => d && updateMainDate(d)} initialFocus locale={ptBR} disabled={isDateDisabled}/>
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
            <Input id="hours" type="number" placeholder="Ex: 8.5" value={manualHours} onChange={e => setManualHours(e.target.value)} className="pl-10" disabled={data.timeEntries.length > 0}/>
          </div>
        </div>
      </div>
    </div>
  );
}

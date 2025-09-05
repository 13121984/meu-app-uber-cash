
"use client";

import { Dispatch, useState, useEffect } from 'react';
import { CalendarIcon, Clock, Milestone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Action = { type: 'SET_BASIC_INFO'; payload: { date: Date; km: number; hours: number } };
type State = { date: Date; km: number; hours: number };

interface Step1InfoProps {
  data: State;
  dispatch: Dispatch<Action>;
}

export function Step1Info({ data, dispatch }: Step1InfoProps) {
  // Initialize as empty strings to avoid hydration mismatch
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYearState] = useState('');

  // Populate fields only on the client-side after mount
  useEffect(() => {
    if (data.date && isValid(data.date)) {
      setDay(format(data.date, 'dd'));
      setMonth(format(data.date, 'MM'));
      setYearState(format(data.date, 'yyyy'));
    }
  }, [data.date]);

  const updateMainDate = (newDay: number, newMonth: number, newYear: number) => {
    // Month is 0-indexed in JS Date
    const updatedDate = new Date(newYear, newMonth - 1, newDay);

    if (isValid(updatedDate) && updatedDate.getFullYear() === newYear && (updatedDate.getMonth() + 1) === newMonth && updatedDate.getDate() === newDay) {
      dispatch({
        type: 'SET_BASIC_INFO',
        payload: { ...data, date: updatedDate },
      });
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
        dispatch({
            type: 'SET_BASIC_INFO',
            payload: { ...data, date: selectedDate },
        });
    }
  };

  const handleChange = (field: 'km' | 'hours', value: string) => {
    const numValue = parseFloat(value) || 0;
    dispatch({
      type: 'SET_BASIC_INFO',
      payload: { ...data, [field]: numValue },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold font-headline">Informações do Dia</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date-day">Data do Trabalho</Label>
          <div className="flex items-center gap-2">
            <Input
              id="date-day"
              type="number"
              placeholder="DD"
              value={day}
              onChange={handleDayChange}
              className="w-16 text-center"
            />
             <Input
              id="date-month"
              type="number"
              placeholder="MM"
              value={month}
              onChange={handleMonthChange}
              className="w-16 text-center"
            />
             <Input
              id="date-year"
              type="number"
              placeholder="AAAA"
              value={year}
              onChange={handleYearChange}
              className="w-24 text-center"
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={data.date}
                        onSelect={handleDateSelect}
                        initialFocus
                        locale={ptBR}
                    />
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


"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Calculator, Info, Route, Clock, DollarSign, Save, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateUserPreferences, TaximeterRates } from '@/services/auth.service';
import { add, isBefore, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

const taximeterSchema = z.object({
  distance: z.number().positive("A distância deve ser maior que zero."),
  duration: z.number().positive("A duração deve ser maior que zero."),
});

const ratesSchema = z.object({
    ratePerKm: z.number().min(0, "A tarifa deve ser um valor positivo."),
    ratePerMinute: z.number().min(0, "A tarifa deve ser um valor positivo."),
})

type TaximeterFormData = z.infer<typeof taximeterSchema>;
type RatesFormData = z.infer<typeof ratesSchema>;

export function TaximeterClient() {
  const { user, refreshUser } = useAuth();
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [calculation, setCalculation] = useState<{ total: number; base: number; time: number } | null>(null);

  const taximeterForm = useForm<TaximeterFormData>({ resolver: zodResolver(taximeterSchema) });
  const ratesForm = useForm<RatesFormData>({
    resolver: zodResolver(ratesSchema),
    defaultValues: {
      ratePerKm: user?.preferences.taximeterRates?.ratePerKm || 2.5,
      ratePerMinute: user?.preferences.taximeterRates?.ratePerMinute || 0.4,
    }
  });

  useEffect(() => {
    if (user?.preferences.taximeterRates) {
        ratesForm.reset(user.preferences.taximeterRates);
    }
  }, [user, ratesForm]);

  const lastUse = useMemo(() => user?.preferences.lastTaximeterUse ? parseISO(user.preferences.lastTaximeterUse) : null, [user]);
  const nextAvailableUse = useMemo(() => lastUse ? add(lastUse, { weeks: 1 }) : null, [lastUse]);
  const canUseTaximeter = useMemo(() => {
    if (user?.isPremium) return true;
    return !nextAvailableUse || isBefore(nextAvailableUse, new Date());
  }, [user, nextAvailableUse]);

  const handleCalculate = (data: TaximeterFormData) => {
    if (!user || !canUseTaximeter) return;

    const rates = ratesForm.getValues();
    const baseValue = data.distance * rates.ratePerKm;
    const timeValue = data.duration * rates.ratePerMinute;
    const totalValue = baseValue + timeValue;
    setCalculation({ total: totalValue, base: baseValue, time: timeValue });
    
    if (!user.isPremium) {
      updateUserPreferences(user.id, { lastTaximeterUse: new Date().toISOString() }).then(refreshUser);
    }
  };

  const handleSaveRates = async (data: RatesFormData) => {
    if (!user) return;
    setIsSavingRates(true);
    const result = await updateUserPreferences(user.id, { taximeterRates: data });
    if (result.success) {
      toast({ title: "Tarifas Salvas!", description: "Suas novas tarifas foram salvas." });
      await refreshUser();
    } else {
      toast({ title: "Erro", description: "Não foi possível salvar as tarifas.", variant: "destructive" });
    }
    setIsSavingRates(false);
  };
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  if (!user) return <Loader2 className="h-12 w-12 animate-spin text-primary" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Coluna Principal: Formulários */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Calcular Corrida</CardTitle>
            <CardDescription>Insira os dados da corrida para obter o valor com base nas suas tarifas.</CardDescription>
          </CardHeader>
          <CardContent>
            {!canUseTaximeter && nextAvailableUse ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Limite Atingido</AlertTitle>
                    <AlertDescription>
                        Você já usou seu cálculo gratuito desta semana. A próxima utilização estará disponível{' '}
                        <strong>{formatDistanceToNow(nextAvailableUse, { addSuffix: true, locale: ptBR })}</strong>.
                        <Link href="/premium" className="block mt-2 font-bold underline">Faça um upgrade para uso ilimitado!</Link>
                    </AlertDescription>
                </Alert>
            ) : (
                 <form onSubmit={taximeterForm.handleSubmit(handleCalculate)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Controller
                            name="distance"
                            control={taximeterForm.control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label htmlFor="distance">Distância (KM)</Label>
                                    <div className="relative">
                                        <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="distance" type="number" step="0.1" placeholder="Ex: 15.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="pl-10" />
                                    </div>
                                    {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                </div>
                            )}
                        />
                         <Controller
                            name="duration"
                            control={taximeterForm.control}
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label htmlFor="duration">Duração (Minutos)</Label>
                                     <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="duration" type="number" placeholder="Ex: 30" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="pl-10" />
                                    </div>
                                    {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                                </div>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <Calculator className="mr-2 h-4 w-4" />
                        Calcular Valor
                    </Button>
                </form>
            )}
          </CardContent>
        </Card>
        
        <Card>
            <form onSubmit={ratesForm.handleSubmit(handleSaveRates)}>
            <CardHeader>
                <CardTitle className="font-headline">Minhas Tarifas</CardTitle>
                <CardDescription>Defina seus valores por quilômetro e por minuto. Eles ficarão salvos.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Controller
                    name="ratePerKm"
                    control={ratesForm.control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Label htmlFor="ratePerKm">Preço por KM</Label>
                             <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                <Input id="ratePerKm" type="number" step="0.01" placeholder="Ex: 2.50" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="pl-10" />
                            </div>
                            {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />
                 <Controller
                    name="ratePerMinute"
                    control={ratesForm.control}
                    render={({ field, fieldState }) => (
                        <div>
                            <Label htmlFor="ratePerMinute">Preço por Minuto</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                                <Input id="ratePerMinute" type="number" step="0.01" placeholder="Ex: 0.40" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="pl-10" />
                            </div>
                            {fieldState.error && <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>}
                        </div>
                    )}
                />
            </CardContent>
            <CardFooter>
                 <Button type="submit" variant="secondary" disabled={isSavingRates}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingRates ? 'Salvando...' : 'Salvar Tarifas'}
                </Button>
            </CardFooter>
            </form>
        </Card>
      </div>

      {/* Coluna Lateral: Resultado e Info */}
      <div className="md:col-span-1 space-y-6">
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="font-headline">Resultado do Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                {calculation ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Valor Total Sugerido</p>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-500">{formatCurrency(calculation.total)}</p>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 text-left">
                            <p>Baseado em:</p>
                            <p><strong>Distância:</strong> {formatCurrency(calculation.base)}</p>
                            <p><strong>Tempo:</strong> {formatCurrency(calculation.time)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <Calculator className="h-12 w-12 mx-auto mb-4" />
                        <p>Preencha os dados da corrida e clique em "Calcular" para ver o resultado aqui.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Como funciona?</AlertTitle>
            <AlertDescription>
            O valor final é calculado pela fórmula: <br/>
            <code className="text-xs p-1 bg-muted rounded-md">(Distância × Tarifa/KM) + (Duração × Tarifa/Minuto)</code>
            </AlertDescription>
        </Alert>
         {!user.isPremium && (
            <Link href="/premium">
                <Card className="bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground hover:scale-105 transition-transform cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles />
                            Uso Ilimitado com Premium
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                            Faça quantos cálculos precisar, sem restrições semanais.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </Link>
         )}
      </div>
    </div>
  );
}

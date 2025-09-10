
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Square, Timer, Map, DollarSign, Loader2, Settings, Lock, CalculatorIcon, Check, ArrowRight } from 'lucide-react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { toast } from '@/hooks/use-toast';
import { updateUserPreferences, TaximeterRates, UserPreferences } from '@/services/auth.service';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { addOrUpdateWorkDay } from '@/services/work-day.service';
import { isAfter, add, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { updateAllSummaries } from '@/services/summary.service';

// Helper para calcular a distância (fórmula de Haversine)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DisplayCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string, unit?: string }) => (
    <Card className="flex-1 text-center bg-secondary/50">
        <CardContent className="p-4">
            <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold font-mono">{value}{unit}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
);

export function TaximeterClient() {
    const { user, loading, refreshUser } = useAuth();
    const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
    const [distance, setDistance] = useState(0); // em km
    const [time, setTime] = useState(0); // em segundos
    const [lastPosition, setLastPosition] = useState<Position | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [rates, setRates] = useState<TaximeterRates>({ startingFare: 3.0, ratePerKm: 2.5, ratePerMinute: 0.4 });
    const [totalCost, setTotalCost] = useState(0);
    
    // State for the confirmation dialog
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [finalRideData, setFinalRideData] = useState<{distance: number, time: number, cost: number} | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const watchId = useRef<string | null>(null);

    useEffect(() => {
        if (user?.preferences.taximeterRates) {
            setRates(user.preferences.taximeterRates);
        }
    }, [user]);

    useEffect(() => {
        const cost = rates.startingFare + (distance * rates.ratePerKm) + ((time / 60) * rates.ratePerMinute);
        setTotalCost(cost);
    }, [distance, time, rates]);


    const checkUsage = () => {
        if (!user) return { canUse: false, timeLeft: '' };
        if (user.plan === 'pro' || user.plan === 'autopilot') return { canUse: true, timeLeft: '' };
        
        const lastUse = user.preferences.lastTaximeterUse;
        if (!lastUse) return { canUse: true, timeLeft: '' }; // Never used before

        const lastUseDate = new Date(lastUse);
        const nextAllowedUse = add(lastUseDate, { weeks: 1 });
        
        const canUse = isAfter(new Date(), nextAllowedUse);
        const timeLeft = canUse ? '' : formatDistanceToNowStrict(nextAllowedUse, { locale: ptBR, unit: 'day' });

        return { canUse, timeLeft };
    };

    const usageStatus = checkUsage();

    const startTracking = useCallback(async () => {
        try {
            const permission = await Geolocation.checkPermissions();
            if (permission.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    toast({ title: "Permissão Negada", description: "O acesso ao GPS é necessário para o taxímetro.", variant: "destructive" });
                    return false;
                }
            }

            watchId.current = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000 }, (position, err) => {
                if (err) {
                    console.error('Geolocation error', err);
                    stopTracking(); // Para de observar se houver um erro
                    toast({ title: "Erro de GPS", description: "Sinal de GPS perdido ou indisponível.", variant: "destructive" });
                    setStatus('paused'); // Pausa a corrida
                    return;
                }
                if (position && lastPosition) {
                    const newDistance = getDistance(
                        lastPosition.coords.latitude,
                        lastPosition.coords.longitude,
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    setDistance(prev => prev + newDistance);
                }
                setLastPosition(position);
            });
            return true;
        } catch (e) {
             toast({ title: "Erro de GPS", description: "Não foi possível iniciar o rastreamento por GPS.", variant: "destructive" });
             return false;
        }
    }, [lastPosition]);

    const stopTracking = () => {
        if (watchId.current) {
            Geolocation.clearWatch({ id: watchId.current });
            watchId.current = null;
        }
         if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    
    const startRide = async () => {
        if (!usageStatus.canUse) {
            toast({ title: "Limite Atingido", description: `Você poderá usar o taxímetro novamente em aproximadamente ${usageStatus.timeLeft}.`, variant: "destructive"});
            return;
        }
        
        resetState();
        const trackingStarted = await startTracking();
        if (trackingStarted) {
            setStatus('running');
            timerRef.current = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
    };

    const pauseRide = () => {
        stopTracking();
        setStatus('paused');
    };

    const resumeRide = async () => {
        const trackingResumed = await startTracking();
         if (trackingResumed) {
            setStatus('running');
            timerRef.current = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }
    };
    
    const finishRide = async () => {
        stopTracking();
        setFinalRideData({ distance, time, cost: totalCost });
        setIsConfirmOpen(true);
    };

    const confirmAndSaveRide = async () => {
        if (!finalRideData || !user) return;

        setStatus('idle');
        
        const result = await addOrUpdateWorkDay(user.id, {
            id: '',
            date: new Date(),
            km: finalRideData.distance,
            hours: finalRideData.time / 3600, // Converte segundos para horas
            timeEntries: [],
            earnings: [{
                id: Date.now(),
                category: 'Particular', // Salva como 'Particular'
                trips: 1,
                amount: finalRideData.cost
            }],
            fuelEntries: [],
            maintenanceEntries: [],
        });
        
        if (result.success) {
            await updateAllSummaries(user.id);
            toast({
                title: "Corrida Salva!",
                description: `A corrida de ${formatCurrency(finalRideData.cost)} foi salva no seu histórico.`
            });
        }
        
        if (user.plan === 'basic') {
            await updateUserPreferences(user.id, { lastTaximeterUse: new Date().toISOString() });
            await refreshUser();
        }

        resetState();
        setFinalRideData(null);
        setIsConfirmOpen(false);
    }
    
    const resetState = () => {
        setTime(0);
        setDistance(0);
        setLastPosition(null);
    }
    
    const handleRateChange = (field: keyof TaximeterRates, value: string) => {
        const numValue = parseFloat(value) || 0;
        setRates(prev => ({...prev, [field]: numValue }));
    }
    
    const saveRates = async () => {
        if (!user) return;
        setIsSaving(true);
        const result = await updateUserPreferences(user.id, { taximeterRates: rates });
        if(result.success) {
            toast({ title: "Tarifas Salvas!", description: "Suas novas tarifas foram salvas com sucesso."});
            await refreshUser();
        } else {
             toast({ title: "Erro", description: "Não foi possível salvar as tarifas.", variant: "destructive" });
        }
        setIsSaving(false);
    }

     if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (!usageStatus.canUse) {
        return (
             <Card className="text-center p-8 space-y-4">
                 <Lock className="mx-auto h-12 w-12 text-primary mb-4"/>
                <CardTitle>Uso Semanal Esgotado</CardTitle>
                <CardDescription className="my-2">
                    Usuários do plano Básico podem usar o taxímetro uma vez por semana para corridas particulares.
                    <br/>
                    Seu próximo uso estará disponível em aproximadamente <strong className="text-primary">{usageStatus.timeLeft}</strong>.
                </CardDescription>
                <Link href="/premium">
                    <Button>
                        Seja Pro para uso ilimitado
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
             </Card>
        )
    }

    return (
        <>
        <div className="space-y-6">
            {/* Display */}
            <Card className="bg-card shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                    <p className="text-muted-foreground">Valor Estimado da Corrida</p>
                    <p className="text-6xl font-bold font-mono text-primary">{formatCurrency(totalCost)}</p>
                    <div className="flex gap-4">
                        <DisplayCard icon={Map} label="Distância" value={distance.toFixed(2)} unit="km" />
                        <DisplayCard icon={Timer} label="Tempo" value={new Date(time * 1000).toISOString().substr(11, 8)} />
                    </div>
                </CardContent>
            </Card>

            {/* Controles */}
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {status === 'idle' && (
                        <Button size="lg" className="h-16 text-lg col-span-full" onClick={startRide}>
                            <Play className="mr-2 h-6 w-6"/> Iniciar Corrida
                        </Button>
                    )}
                    {status === 'running' && (
                        <>
                            <Button size="lg" className="h-16 text-lg" variant="secondary" onClick={pauseRide}>
                                <Pause className="mr-2 h-6 w-6" /> Pausar
                            </Button>
                            <Button size="lg" className="h-16 text-lg col-span-2" variant="destructive" onClick={finishRide}>
                                <Square className="mr-2 h-6 w-6" /> Finalizar e Salvar
                            </Button>
                        </>
                    )}
                    {status === 'paused' && (
                        <>
                            <Button size="lg" className="h-16 text-lg" onClick={resumeRide}>
                                <Play className="mr-2 h-6 w-6" /> Retomar
                            </Button>
                            <Button size="lg" className="h-16 text-lg col-span-2" variant="destructive" onClick={finishRide}>
                                <Square className="mr-2 h-6 w-6" /> Finalizar e Salvar
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rates">
                    <Card>
                        <AccordionTrigger className="p-6 [&[data-state=open]>svg]:text-primary">
                             <CardTitle className="font-headline flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary"/>
                                Suas Tarifas
                            </CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                 <div>
                                    <Label htmlFor="startingFare">Taxa de Partida (Bandeirada)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                        <Input id="startingFare" type="number" value={rates.startingFare} onChange={(e) => handleRateChange('startingFare', e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="ratePerKm">Preço por KM</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                            <Input id="ratePerKm" type="number" value={rates.ratePerKm} onChange={(e) => handleRateChange('ratePerKm', e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="ratePerMinute">Preço por Minuto</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                            <Input id="ratePerMinute" type="number" value={rates.ratePerMinute} onChange={(e) => handleRateChange('ratePerMinute', e.target.value)} className="pl-10"/>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={saveRates} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Salvar Tarifas
                                </Button>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Finalizar e Registrar Corrida?</AlertDialogTitle>
                <AlertDialogDescription>
                    O valor final da corrida foi: 
                    <span className="block text-2xl font-bold text-primary my-2">{formatCurrency(finalRideData?.cost || 0)}</span>
                    Deseja salvar este registro no seu histórico do dia?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                    setIsConfirmOpen(false);
                    resumeRide(); // Retoma a corrida se o usuário cancelar
                }}>Não, voltar para a corrida</AlertDialogCancel>
                <AlertDialogAction onClick={confirmAndSaveRide}>
                    <Check className="mr-2 h-4 w-4" />
                    Sim, registrar corrida
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

export default function TaximetroPage() {
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <CalculatorIcon className="w-8 h-8 text-primary" />
            Taxímetro Inteligente
        </h1>
        <p className="text-muted-foreground">Calcule suas corridas particulares em tempo real com base nas suas tarifas.</p>
      </div>
      <TaximeterClient />
    </div>
  );
}

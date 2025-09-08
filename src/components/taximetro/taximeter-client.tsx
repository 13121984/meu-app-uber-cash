
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Square, Timer, Map, DollarSign, Loader2, AlertTriangle, Settings, Lock } from 'lucide-react';
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
            <p className="text-3xl font-bold font-mono">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
);

export function TaximeterClient() {
    const { user, refreshUser } = useAuth();
    const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
    const [distance, setDistance] = useState(0); // em km
    const [time, setTime] = useState(0); // em segundos
    const [lastPosition, setLastPosition] = useState<Position | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [rates, setRates] = useState<TaximeterRates>({ startingFare: 3.0, ratePerKm: 2.5, ratePerMinute: 0.4 });
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const watchId = useRef<string | null>(null);

    useEffect(() => {
        if (user?.preferences.taximeterRates) {
            setRates({
                startingFare: user.preferences.taximeterRates.startingFare || 3.0,
                ratePerKm: user.preferences.taximeterRates.ratePerKm || 2.5,
                ratePerMinute: user.preferences.taximeterRates.ratePerMinute || 0.4,
            });
        }
    }, [user]);

    const canUseTaximeter = useMemo(() => {
        if (!user) return false;
        if (user.isPremium) return true;
        
        const lastUse = user.preferences.lastTaximeterUse ? new Date(user.preferences.lastTaximeterUse) : null;
        if (!lastUse) return true;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return lastUse < oneWeekAgo;

    }, [user]);


    const startTracking = useCallback(async () => {
        try {
            const permission = await Geolocation.checkPermissions();
            if (permission.location !== 'granted') {
                const request = await Geolocation.requestPermissions();
                if (request.location !== 'granted') {
                    toast({ title: "Permissão Negada", description: "O acesso ao GPS é necessário para o taxímetro.", variant: "destructive" });
                    return;
                }
            }

            watchId.current = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 10000 }, (position, err) => {
                if (err) {
                    console.error('Geolocation error', err);
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

        } catch (e) {
             toast({ title: "Erro de GPS", description: "Não foi possível iniciar o rastreamento por GPS.", variant: "destructive" });
        }
    }, [lastPosition]);

    const stopTracking = () => {
        if (watchId.current) {
            Geolocation.clearWatch({ id: watchId.current });
            watchId.current = null;
        }
    };
    
    const startRide = async () => {
        if (!canUseTaximeter) {
            toast({ title: "Limite Atingido", description: "Usuários gratuitos podem usar o taxímetro uma vez por semana.", variant: "destructive"});
            return;
        }
        
        resetState();
        await startTracking();
        setStatus('running');
        timerRef.current = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);
    };

    const pauseRide = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopTracking();
        setStatus('paused');
    };

    const resumeRide = async () => {
        await startTracking();
        setStatus('running');
        timerRef.current = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);
    };

    const finishRide = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        stopTracking();
        setStatus('idle');
        
        if (user && !user.isPremium) {
            await updateUserPreferences(user.id, { lastTaximeterUse: new Date().toISOString() });
            await refreshUser();
        }
    };
    
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

    const totalCost = rates.startingFare + (distance * rates.ratePerKm) + ((time / 60) * rates.ratePerMinute);

    if (!canUseTaximeter) {
        return (
             <Card className="text-center p-8 border-dashed">
                 <Lock className="mx-auto h-12 w-12 text-primary mb-4"/>
                <CardTitle>Uso Semanal Esgotado</CardTitle>
                <CardDescription className="my-2">Você já utilizou o taxímetro esta semana.</CardDescription>
                <Link href="/premium">
                    <Button>Seja Premium para uso ilimitado</Button>
                </Link>
             </Card>
        )
    }

    return (
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
                                <Square className="mr-2 h-6 w-6" /> Finalizar Corrida
                            </Button>
                        </>
                    )}
                    {status === 'paused' && (
                        <>
                            <Button size="lg" className="h-16 text-lg" onClick={resumeRide}>
                                <Play className="mr-2 h-6 w-6" /> Retomar
                            </Button>
                            <Button size="lg" className="h-16 text-lg col-span-2" variant="destructive" onClick={finishRide}>
                                <Square className="mr-2 h-6 w-6" /> Finalizar Corrida
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
            
            {/* Configuração de Tarifas */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <Card>
                        <AccordionTrigger className="p-6 [&[data-state=open]>svg]:text-primary">
                             <CardTitle className="font-headline flex items-center gap-2">
                                <Settings className="w-5 h-5"/>
                                Suas Tarifas
                            </CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="startingFare" className="text-sm font-medium">Taxa de Partida (Bandeirada)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input id="startingFare" type="number" value={rates.startingFare} onChange={(e) => handleRateChange('startingFare', e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ratePerKm" className="text-sm font-medium">Preço por KM</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input id="ratePerKm" type="number" value={rates.ratePerKm} onChange={(e) => handleRateChange('ratePerKm', e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="ratePerMinute" className="text-sm font-medium">Preço por Minuto</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
    );
}

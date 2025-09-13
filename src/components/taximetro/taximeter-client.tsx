
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Square,
  Loader2,
  Settings,
  DollarSign,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
  Gem,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { TaximeterRates } from "@/services/auth.service";
import Link from "next/link";
import { updateUserPreferencesAction } from "@/app/gerenciamento/actions";

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const defaultRates: TaximeterRates = {
  startingFare: 3.0,
  ratePerKm: 2.5,
  ratePerMinute: 0.25,
};

function SettingsDialog({
  rates,
  onSave,
  isPremium,
}: {
  rates: TaximeterRates;
  onSave: (newRates: TaximeterRates) => void;
  isPremium: boolean;
}) {
  const [currentRates, setCurrentRates] = useState(rates);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave(currentRates);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Tarifas do Taxímetro</DialogTitle>
          <DialogDescription>
            Defina seus preços para corridas particulares.
            {isPremium ? "" : " Usuários gratuitos não podem alterar as tarifas."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="startingFare">Bandeirada (R$)</Label>
            <Input
              id="startingFare"
              type="number"
              value={currentRates.startingFare}
              onChange={(e) =>
                setCurrentRates({
                  ...currentRates,
                  startingFare: parseFloat(e.target.value) || 0,
                })
              }
              disabled={!isPremium}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePerKm">Preço por KM (R$)</Label>
            <Input
              id="ratePerKm"
              type="number"
              value={currentRates.ratePerKm}
              onChange={(e) =>
                setCurrentRates({
                  ...currentRates,
                  ratePerKm: parseFloat(e.target.value) || 0,
                })
              }
              disabled={!isPremium}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePerMinute">Preço por Minuto (R$)</Label>
            <Input
              id="ratePerMinute"
              type="number"
              value={currentRates.ratePerMinute}
              onChange={(e) =>
                setCurrentRates({
                  ...currentRates,
                  ratePerMinute: parseFloat(e.target.value) || 0,
                })
              }
              disabled={!isPremium}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!isPremium}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PremiumUpgradeScreen() {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-6">
             <div className="relative w-48 h-48">
                 <DollarSign className="absolute w-24 h-24 text-muted-foreground/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <Gem className="absolute w-16 h-16 text-primary bottom-0 right-0 animate-pulse" />
             </div>
            <h1 className="text-3xl font-bold font-headline text-primary">Taxímetro Ilimitado</h1>
            <p className="text-lg text-muted-foreground max-w-lg">
               Use o taxímetro quantas vezes quiser e personalize suas tarifas para corridas particulares. Um benefício dos planos Pro e Autopilot.
            </p>
            <Link href="/premium" passHref>
                <Button size="lg" className="animate-pulse">
                    <Lock className="mr-2 h-4 w-4" />
                    Desbloquear com Pro ou Autopilot
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    )
}

export function TaximeterClient() {
  const { user, refreshUser, isPro } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState(0); // em km
  const [time, setTime] = useState(0); // em segundos
  const [total, setTotal] = useState(0);
  const [rates, setRates] = useState<TaximeterRates>(
    user?.preferences.taximeterRates || defaultRates
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const canRun = isPro || !user?.preferences.lastTaximeterUse || new Date().toDateString() !== new Date(user.preferences.lastTaximeterUse).toDateString();

  useEffect(() => {
    setTotal(rates.startingFare + distance * rates.ratePerKm + (time / 60) * rates.ratePerMinute);
  }, [distance, time, rates]);

  const handleSaveRates = async (newRates: TaximeterRates) => {
    if (!user) return;
    setIsLoading(true);
    try {
        await updateUserPreferencesAction(user.id, { taximeterRates: newRates });
        setRates(newRates);
        await refreshUser();
        toast({ title: "Tarifas salvas!", description: "Suas novas tarifas serão usadas no próximo cálculo." });
    } catch(e) {
        toast({ title: "Erro", description: "Não foi possível salvar as tarifas.", variant: "destructive"});
    }
    setIsLoading(false);
  };
  

  const calculateDistance = (pos1: GeolocationCoordinates, pos2: GeolocationCoordinates) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.latitude * Math.PI / 180) * Math.cos(pos2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const startTracking = async () => {
    if (!canRun) {
        toast({ title: "Limite diário atingido", description: "Usuários do plano gratuito podem usar o taxímetro uma vez por dia. Faça upgrade para uso ilimitado.", variant: "destructive" });
        return;
    }
    
    if (!navigator.geolocation) {
        toast({ title: "Geolocalização não suportada", variant: "destructive" });
        return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
        setIsRunning(true);
        setIsLoading(false);
        lastPositionRef.current = position;

        if (user && !isPro) {
            await updateUserPreferencesAction(user.id, { lastTaximeterUse: new Date().toISOString() });
            await refreshUser();
        }

        intervalRef.current = setInterval(() => {
            setTime(prev => prev + 1);
        }, 1000);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (newPosition) => {
                if (lastPositionRef.current) {
                    const newDistance = calculateDistance(lastPositionRef.current.coords, newPosition.coords);
                    setDistance(prev => prev + newDistance);
                }
                lastPositionRef.current = newPosition;
            },
            (error) => {
                toast({ title: "Erro de Geolocalização", description: error.message, variant: "destructive" });
                stopTracking(false);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    }, (error) => {
        toast({ title: "Erro ao obter localização inicial", description: error.message, variant: "destructive"});
        setIsLoading(false);
    });
  };

  const stopTracking = (reset: boolean) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    intervalRef.current = null;
    watchIdRef.current = null;
    lastPositionRef.current = null;

    if (reset) {
        setDistance(0);
        setTime(0);
    }
  };

  if (!canRun) {
      return <PremiumUpgradeScreen />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Display do Taxímetro</CardTitle>
            <SettingsDialog rates={rates} onSave={handleSaveRates} isPremium={isPro} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500"/> Total
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {formatCurrency(total)}
              </dd>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500"/> Distância
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {distance.toFixed(2)} <span className="text-base">km</span>
              </dd>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <dt className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-orange-500"/> Tempo
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {new Date(time * 1000).toISOString().substr(11, 8)}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {!isRunning ? (
              <Button
                size="lg"
                className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700"
                onClick={startTracking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Play className="mr-2 h-6 w-6" />
                )}
                Iniciar
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 h-16 text-lg"
                variant="destructive"
                onClick={() => stopTracking(false)}
              >
                <Pause className="mr-2 h-6 w-6" /> Pausar
              </Button>
            )}
            <Button
              size="lg"
              className="flex-1 h-16 text-lg"
              variant="outline"
              onClick={() => stopTracking(true)}
              disabled={isRunning || isLoading}
            >
              <Square className="mr-2 h-6 w-6" /> Zerar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/hooks/use-toast";
import { saveSettings, getSettings } from '@/services/settings.service';
import { getCatalog, Catalog } from '@/services/catalog.service';
import { useRouter } from 'next/navigation';
import { Paintbrush, Bell, Save, Loader2, CheckCircle, AlertTriangle, Moon, Sun, Lock } from 'lucide-react';
import type { Settings, AppTheme } from '@/types/settings';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

// Schema continua o mesmo
const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    maintenanceNotifications: z.boolean(),
    defaultFuelType: z.string().min(1, { message: "Selecione um tipo de combustível." }),
});

const themes: { value: AppTheme; label: string, icon: React.ElementType }[] = [
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'light', label: 'Claro', icon: Sun },
];

function SettingsFormInternal({ initialSettings, fuelTypes }: { initialSettings: Settings, fuelTypes: string[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const isPremium = user?.isPremium || false;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<Omit<Settings, 'weeklyBackup' | 'backupEmail'>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        theme: initialSettings.theme,
        maintenanceNotifications: initialSettings.maintenanceNotifications,
        defaultFuelType: initialSettings.defaultFuelType,
    },
  });

  const onSubmit = async (data: Omit<Settings, 'weeklyBackup' | 'backupEmail'>) => {
    setIsSubmitting(true);
    try {
      // Merging with existing full settings to not lose backup fields
      const existingSettings = await getSettings();
      const settingsToSave = { ...existingSettings, ...data };
      
      await saveSettings(settingsToSave);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Configurações Salvas!</span></div>,
        description: "Suas preferências foram atualizadas. A página será recarregada.",
      });
      window.location.reload(); 
    } catch (error) {
      toast({
        title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro ao Salvar</span></div>,
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2 font-headline"><Paintbrush className="h-6 w-6 text-primary" />Preferências Gerais</CardTitle>
                    <CardDescription>Personalize o visual e as notificações do aplicativo.</CardDescription>
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tema */}
                    <div className="space-y-2">
                        <Label>Tema do Aplicativo</Label>
                        <Controller
                            name="theme"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um tema..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {themes.map(theme => (
                                            <SelectItem key={theme.value} value={theme.value}>
                                                <div className="flex items-center gap-2">
                                                    <theme.icon className="h-4 w-4" />
                                                    {theme.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    {/* Combustível Padrão */}
                     <div className="space-y-2">
                        <Label>Tipo de Combustível Padrão</Label>
                        <Controller
                            name="defaultFuelType"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fuelTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.defaultFuelType && <p className="text-sm text-destructive">{errors.defaultFuelType.message}</p>}
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                     {/* Notificações */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="flex items-center gap-2">
                                Habilitar Notificações de Manutenção
                                {!isPremium && <Lock className="h-4 w-4 text-amber-500" />}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {isPremium ? 'Funcionalidade em desenvolvimento.' : (<Link href="/premium" className="underline hover:text-primary">Exclusivo para assinantes Premium.</Link>)}
                            </p>
                        </div>
                        <Controller 
                            name="maintenanceNotifications" 
                            control={control} 
                            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isPremium}/>} 
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    </form>
  );
}

export function SettingsForm() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadInitialData() {
            setIsLoading(true);
            try {
                const [settingsData, catalogData] = await Promise.all([
                    getSettings(),
                    getCatalog(),
                ]);
                setSettings(settingsData);
                setCatalog(catalogData);
            } catch (error) {
                toast({
                    title: "Erro ao carregar configurações",
                    description: "Não foi possível buscar os dados iniciais.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, []);

    if (isLoading || !settings || !catalog) {
        return (
            <Card>
                <CardHeader className="flex-row justify-between items-center">
                  <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </div>
                   <Skeleton className="h-10 w-36" />
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                     </div>
                </CardContent>
            </Card>
        );
    }
    
    const activeFuelTypes = catalog.fuel.filter(f => f.active).map(f => f.name);
    return <SettingsFormInternal initialSettings={settings} fuelTypes={activeFuelTypes} />;
}

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
import { Paintbrush, Bell, Save, Loader2, CheckCircle, AlertTriangle, Moon, Sun, Send } from 'lucide-react';
import type { Settings, AppTheme } from '@/types/settings';
import { Skeleton } from '../ui/skeleton';
import { runBackupAction } from '@/ai/flows/backup-flow';


// Schema continua o mesmo
const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    weeklyBackup: z.boolean(),
    backupEmail: z.string().email({ message: "Por favor, insira um e-mail válido." }).or(z.literal('')),
    maintenanceNotifications: z.boolean(),
    defaultFuelType: z.string().min(1, { message: "Selecione um tipo de combustível." }),
}).refine(data => data.weeklyBackup ? data.backupEmail !== '' : true, {
    message: "O e-mail de backup é obrigatório para o backup semanal.",
    path: ["backupEmail"],
});

const themes: { value: AppTheme; label: string, icon: React.ElementType }[] = [
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'light', label: 'Claro', icon: Sun },
];

function SettingsFormInternal({ initialSettings, fuelTypes }: { initialSettings: Settings, fuelTypes: string[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingBackup, startBackupTransition] = useTransition();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  const backupEmail = watch('backupEmail');
  const weeklyBackupEnabled = watch('weeklyBackup');

  const onSubmit = async (data: Settings) => {
    setIsSubmitting(true);
    try {
      await saveSettings(data);
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

  const handleTestBackup = () => {
    if (!backupEmail) {
        toast({
            title: 'Email de Backup Necessário',
            description: 'Por favor, insira um email válido para testar o backup.',
            variant: 'destructive'
        });
        return;
    }
    startBackupTransition(async () => {
        const result = await runBackupAction({ backupEmail });
        if (result.success) {
            toast({
                title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Backup Simulado!</span></div>,
                description: result.message,
            });
        } else {
             toast({
                title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro no Backup</span></div>,
                description: result.message,
                variant: 'destructive'
            });
        }
    });
  }
  
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
                     {/* Email de Backup */}
                     <div className="space-y-2">
                        <Label htmlFor="backupEmail">Email para Backup (Google Drive)</Label>
                        <Controller
                            name="backupEmail"
                            control={control}
                            render={({ field }) => <Input id="backupEmail" placeholder="seu-email@gmail.com" {...field} />}
                        />
                        {errors.backupEmail && <p className="text-sm text-destructive">{errors.backupEmail.message}</p>}
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                     {/* Notificações */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Habilitar Notificações de Manutenção</Label>
                            <p className="text-xs text-muted-foreground">Funcionalidade em desenvolvimento.</p>
                        </div>
                        <Controller name="maintenanceNotifications" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange}/>} />
                    </div>
                    {/* Backup Semanal */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Backup Automático Semanal</Label>
                             <p className="text-xs text-muted-foreground">Simulação via botão de teste.</p>
                        </div>
                        <Controller name="weeklyBackup" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                    </div>
                </div>
                 {weeklyBackupEnabled && (
                    <div className="pt-2 flex justify-end">
                        <Button type="button" variant="outline" onClick={handleTestBackup} disabled={isTestingBackup || !backupEmail}>
                            {isTestingBackup ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                            {isTestingBackup ? 'Enviando...' : 'Testar Backup Agora'}
                        </Button>
                    </div>
                )}
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

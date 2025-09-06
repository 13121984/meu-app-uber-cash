"use client";

import { useState, useEffect } from 'react';
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
import { getCatalog } from '@/services/catalog.service';
import { useRouter } from 'next/navigation';
import { Paintbrush, Database, Bell, Save, Loader2, CheckCircle, AlertTriangle, Moon, Sun } from 'lucide-react';
import type { Settings, AppTheme } from '@/types/settings';
import { Skeleton } from '../ui/skeleton';

const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    weeklyBackup: z.boolean(),
    backupEmail: z.string().email({ message: "Por favor, insira um e-mail válido." }).or(z.literal('')),
    maintenanceNotifications: z.boolean(),
    defaultFuelType: z.string(),
});

const themes: { value: AppTheme; label: string, icon: React.ElementType }[] = [
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'light', label: 'Claro', icon: Sun },
];


export function SettingsForm() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<Settings | null>(null);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [settingsData, catalogData] = await Promise.all([
          getSettings(),
          getCatalog(),
        ]);
        setInitialData(settingsData);
        setFuelTypes(catalogData.fuel || []);
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

  const { control, handleSubmit, formState: { errors }, reset } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if(initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = async (data: Settings) => {
    setIsSubmitting(true);
    try {
      await saveSettings(data);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Configurações Salvas!</span></div>,
        description: "Suas preferências foram atualizadas. A página será recarregada.",
      });
      // A página será recarregada para refletir a mudança de tema, se houver.
      // Isso é melhor do que `router.refresh()` para garantir que o tema no `<html>` seja atualizado.
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

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
              </CardContent>
          </Card>
      );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                {/* Aparência */}
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Paintbrush className="h-6 w-6 text-primary" />Aparência</CardTitle>
                    <CardDescription>Personalize o visual do aplicativo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>

                {/* Backup */}
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Database className="h-6 w-6 text-primary" />Backup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Backup Automático Semanal</Label>
                            </div>
                            <Controller name="weeklyBackup" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="backupEmail">Email para Backup (Google Drive)</Label>
                            <Controller
                                name="backupEmail"
                                control={control}
                                render={({ field }) => <Input id="backupEmail" placeholder="seu-email@gmail.com" {...field} />}
                            />
                            {errors.backupEmail && <p className="text-sm text-destructive">{errors.backupEmail.message}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6">
                {/* Notificações e Padrões */}
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Bell className="h-6 w-6 text-primary" />Notificações e Padrões</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Habilitar Notificações de Manutenção</Label>
                            </div>
                            <Controller name="maintenanceNotifications" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange}/>} />
                        </div>
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
                                            {fuelTypes && fuelTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </form>
  );
}

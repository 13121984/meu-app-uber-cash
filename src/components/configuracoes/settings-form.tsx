"use client";

import { useState } from 'react';
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
import { saveSettings } from '@/services/settings.service';
import { useRouter } from 'next/navigation';
import { Paintbrush, Database, Bell, Eye, Save, Loader2, CheckCircle, AlertTriangle, Moon, Sun } from 'lucide-react';
import type { Settings, TextColor, AppTheme } from '@/types/settings';
import { cn } from '@/lib/utils';


const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    textColor: z.enum(['white', 'gray', 'purple']),
    weeklyBackup: z.boolean(),
    backupEmail: z.string().email({ message: "Por favor, insira um e-mail válido." }).or(z.literal('')),
    maintenanceNotifications: z.boolean(),
    defaultFuelType: z.enum(['Etanol', 'Gasolina Aditivada', 'GNV', '']),
});

interface SettingsFormProps {
  initialData: Settings;
}

const textColors: { value: TextColor; label: string }[] = [
    { value: 'white', label: 'Branco' },
    { value: 'gray', label: 'Cinza' },
    { value: 'purple', label: 'Roxo' },
];

const themes: { value: AppTheme; label: string, icon: React.ElementType }[] = [
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'light', label: 'Claro', icon: Sun },
];

const fuelTypes = ['Etanol', 'Gasolina Aditivada', 'GNV'];

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTextColor, setPreviewTextColor] = useState(initialData.textColor || 'white');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const watchTextColor = watch('textColor', initialData.textColor);

  const onSubmit = async (data: Settings) => {
    setIsSubmitting(true);
    try {
      await saveSettings(data);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Configurações Salvas!</span></div>,
        description: "Suas preferências foram atualizadas.",
      });
      router.refresh();
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                     <div className="space-y-2">
                        <Label>Cor do Texto</Label>
                        <Controller
                            name="textColor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    setPreviewTextColor(value as TextColor);
                                }} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                         {textColors.map(color => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-4 h-4 rounded-full", {
                                                        'bg-white': color.value === 'white',
                                                        'bg-gray-400': color.value === 'gray',
                                                        'bg-purple-500': color.value === 'purple'
                                                    })} />
                                                    {color.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-sm text-muted-foreground">Personalize a cor do texto para melhor contraste e legibilidade</p>
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
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    </div>
                </CardContent>
            </Card>

            {/* Prévia do Visual */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Eye className="h-6 w-6 text-primary" />Prévia do Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className={cn("p-4 rounded-lg bg-card border", {
                         'text-white': watchTextColor === 'white',
                         'text-gray-300': watchTextColor === 'gray',
                         'text-purple-400': watchTextColor === 'purple',
                    })}>
                        <h4 className="font-bold">Exemplo de Card</h4>
                        <p className="text-sm">Este é um exemplo de como o texto aparecerá com as configurações atuais.</p>
                    </div>
                     <div className={cn("p-4 rounded-lg bg-green-800/50 border border-green-700", {
                         'text-white': watchTextColor === 'white',
                         'text-gray-300': watchTextColor === 'gray',
                         'text-purple-400': watchTextColor === 'purple',
                    })}>
                        <h4 className="font-bold">Outro Exemplo</h4>
                        <p className="text-sm ">Ajuste a cor do texto para melhor legibilidade em diferentes temas.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </form>
  );
}

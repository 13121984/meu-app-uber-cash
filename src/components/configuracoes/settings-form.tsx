
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
import { saveSettings } from '@/services/settings.service';
import { useRouter } from 'next/navigation';
import { Paintbrush, Database, Bell, Eye, Save, Loader2, CheckCircle, AlertTriangle, Moon, Sun, Palette } from 'lucide-react';
import type { Settings, TextColor, AppTheme } from '@/types/settings';
import { cn } from '@/lib/utils';
import { getTextColorValue } from '@/lib/color-map';


const settingsSchema = z.object({
    theme: z.enum(['light', 'dark']),
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
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

const colorOptions: { name: string; value: string }[] = [
    { name: 'Roxo (Padrão)', value: '250 80% 65%' },
    { name: 'Azul Vibrante', value: '210 90% 60%' },
    { name: 'Verde Esmeralda', value: '160 70% 45%' },
    { name: 'Laranja Quente', value: '30 90% 55%' },
    { name: 'Rosa Moderno', value: '330 90% 65%' },
];

const backgroundOptions: { name: string; value: string, theme: 'dark' | 'light' }[] = [
    { name: 'Azul Escuro (Padrão)', value: '224 25% 10%', theme: 'dark' },
    { name: 'Cinza Grafite', value: '220 15% 15%', theme: 'dark' },
    { name: 'Preto Meia-noite', value: '240 10% 5%', theme: 'dark' },
    { name: 'Branco (Padrão)', value: '0 0% 100%', theme: 'light'},
    { name: 'Cinza Claro', value: '220 15% 96%', theme: 'light' },
    { name: 'Branco Neve', value: '210 20% 98%', theme: 'light' },
];


const fuelTypes = ['Etanol', 'Gasolina Aditivada', 'GNV'];

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const watchedFields = watch();
  
  const previewStyle = {
      '--theme-primary': watchedFields.primaryColor,
      '--theme-background': watchedFields.backgroundColor,
      '--theme-foreground': getTextColorValue(watchedFields.textColor, watchedFields.theme).foreground,
      '--theme-card-foreground': getTextColorValue(watchedFields.textColor, watchedFields.theme).cardForeground,
      '--theme-muted-foreground': getTextColorValue(watchedFields.textColor, watchedFields.theme).mutedForeground,
      '--theme-primary-foreground': getTextColorValue(watchedFields.textColor, watchedFields.theme).primaryForeground,
      '--theme-accent': watchedFields.primaryColor,
  } as React.CSSProperties;


  const onSubmit = async (data: Settings) => {
    setIsSubmitting(true);
    try {
      await saveSettings(data);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Configurações Salvas!</span></div>,
        description: "Suas preferências foram atualizadas. A página será recarregada.",
      });
      // Recarrega a página para que o layout aplique as novas variáveis de tema
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
  
  const filteredBackgroundOptions = backgroundOptions.filter(opt => opt.theme === watchedFields.theme);

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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma cor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                         {textColors.map(color => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-4 h-4 rounded-full border", {
                                                        'bg-white': color.value === 'white',
                                                        'bg-gray-400': color.value === 'gray',
                                                        'bg-purple-400': color.value === 'purple'
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

            {/* Cores do App */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Palette className="h-6 w-6 text-primary" />Cores do Aplicativo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Cor Principal</Label>
                         <Controller
                            name="primaryColor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        {colorOptions.map(color => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${color.value})` }} />
                                                    {color.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Cor de Fundo ({watchedFields.theme === 'dark' ? 'Escuro' : 'Claro'})</Label>
                         <Controller
                            name="backgroundColor"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        {filteredBackgroundOptions.map(color => (
                                            <SelectItem key={color.value} value={color.value}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: `hsl(${color.value})` }} />
                                                    {color.name}
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
        </div>
        
        <div className="space-y-6">
            {/* Prévia do Visual */}
            <div style={previewStyle} className={cn(watchedFields.theme)}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Eye className="h-6 w-6 text-primary" />Prévia do Visual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 rounded-lg bg-card">
                        <div className="p-4 rounded-lg border bg-card text-card-foreground">
                            <h4 className="font-bold">Exemplo de Card</h4>
                            <p className="text-sm text-muted-foreground">Este é um exemplo de como o texto aparecerá com as configurações atuais.</p>
                            <Button size="sm" className="mt-2">Botão Principal</Button>
                        </div>
                        <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                            <h4 className="font-bold">Elemento com Cor Primária</h4>
                            <p className="text-sm ">Ajuste a cor para melhor legibilidade.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

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

             {/* Notificações e Padrões */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Bell className="h-6 w-6 text-primary" />Notificações e Padrões</CardTitle>
                </Header>
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
        </div>
      </div>
    </form>
  );
}

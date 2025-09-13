
"use client";

import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Loader2, CheckCircle, AlertTriangle, BellRing, Lock, Wrench, ShieldQuestion, PlusCircle, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Maintenance as MaintenanceType } from '@/services/maintenance.service';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { addMaintenanceAction, updateMaintenanceAction } from '@/app/gerenciamento/actions';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export const maintenanceItemSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(3, "Descrição do item é obrigatória."),
    amount: z.number().min(0, "O valor não pode ser negativo."),
    reminderKm: z.number().nullable(),
    reminderDate: z.date().nullable(),
});

export const maintenanceSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  description: z.string().min(3, "A descrição principal precisa ter pelo menos 3 caracteres.").max(100, "A descrição não pode ter mais de 100 caracteres."),
  type: z.enum(['preventive', 'corrective', 'both'], { required_error: "Selecione o tipo de manutenção."}),
  kmAtService: z.number().nullable(),
  items: z.array(maintenanceItemSchema).min(1, "Adicione pelo menos um item de serviço."),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  initialData: MaintenanceType | null;
  onSuccess: (record: MaintenanceType) => void;
}

export function MaintenanceForm({ initialData, onSuccess }: MaintenanceFormProps) {
  const { user } = useAuth();
  const isAutopilot = user?.plan === 'autopilot';
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: initialData ? { 
        ...initialData, 
        date: new Date(initialData.date),
        items: initialData.items.map(item => ({
            ...item,
            reminderDate: item.reminderDate ? new Date(item.reminderDate) : null,
        }))
     } : {
      date: new Date(),
      description: '',
      type: 'corrective',
      kmAtService: null,
      items: [{
          id: `item-${Date.now()}`, description: '', amount: 0, reminderKm: null, reminderDate: null
      }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let result;
      const dataToSend = { ...data };

      if (initialData?.id) {
        result = await updateMaintenanceAction(user.id, initialData.id, dataToSend);
      } else {
        result = await addMaintenanceAction(user.id, dataToSend);
      }

      if (result.success && result.id) {
        toast({
          title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>,
          description: `Registro ${initialData ? 'atualizado' : 'adicionado'}.`,
        });
        
        const returnedRecord = { ...data, id: result.id };
        onSuccess(returnedRecord as MaintenanceType);

      } else {
        throw new Error(result.error || "Ocorreu um erro desconhecido.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar o registro.";
      toast({
        title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro!</span></div>,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Main Service Info --- */}
        <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descrição Principal do Serviço</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Manutenção do Cabeçote, Revisão dos 100.000km" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Data do Serviço</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal bg-card", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                            ) : (
                                <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus locale={ptBR}/>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="kmAtService"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>KM no momento do serviço</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 85000" {...field} value={field.value || ''} onChange={e => field.onChange(parseInt(e.target.value) || null)}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                    <FormLabel className="flex items-center gap-2"><ShieldQuestion className="w-4 h-4 text-primary"/>Tipo Principal</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row gap-2">
                        <FormItem className="flex items-center space-x-2 space-y-0 flex-1 p-2 border rounded-md has-[:checked]:border-primary bg-card">
                            <FormControl><RadioGroupItem value="preventive" /></FormControl>
                            <FormLabel className="font-normal text-xs">Preventiva</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 flex-1 p-2 border rounded-md has-[:checked]:border-primary bg-card">
                            <FormControl><RadioGroupItem value="corrective" /></FormControl>
                            <FormLabel className="font-normal text-xs">Corretiva</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 flex-1 p-2 border rounded-md has-[:checked]:border-primary bg-card">
                            <FormControl><RadioGroupItem value="both" /></FormControl>
                            <FormLabel className="font-normal text-xs">Ambas</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        {/* --- Service Items --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold font-headline flex items-center gap-2"><Package className="h-5 w-5 text-primary"/> Itens do Serviço</h3>
            <Button type="button" size="sm" variant="destructive" onClick={() => append({ id: `item-${Date.now()}`, description: '', amount: 0, reminderKm: null, reminderDate: null })}>
              <PlusCircle className="mr-2 h-4 w-4"/> Adicionar Item
            </Button>
          </div>
          <ScrollArea className="h-72 w-full pr-4">
            <div className="space-y-4">
            {fields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-secondary/30 relative">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição do Item</FormLabel>
                        <FormControl><Input placeholder="Ex: Mão de obra, Troca de óleo" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (
                        <FormItem>
                        <FormLabel>Custo do Item</FormLabel>
                        <FormControl><Input type="number" placeholder="150,00" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    </div>
                    {/* Reminder Section (Autopilot only) */}
                    <div className="space-y-3 rounded-md border p-3">
                        <div className="flex justify-between items-center">
                            <FormLabel className="flex items-center gap-2"><BellRing className="h-4 w-4 text-primary"/> Lembrete (Opcional)</FormLabel>
                            {!isAutopilot && <Link href="/premium"><Button variant="link" size="sm" className="text-amber-500 h-auto p-0"><Lock className="mr-1 h-3 w-3 text-primary"/> Autopilot</Button></Link>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`items.${index}.reminderKm`} render={({ field }) => (
                                <FormItem>
                                <FormLabel>Lembrar após (KM)</FormLabel>
                                <FormControl><Input type="number" placeholder="Ex: 10000" {...field} value={field.value || ''} onChange={e => field.onChange(parseInt(e.target.value) || null)} disabled={!isAutopilot}/></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name={`items.${index}.reminderDate`} render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Lembrar em (Data)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal bg-card", !field.value && "text-muted-foreground")} disabled={!isAutopilot}>
                                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR}/></PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>
                </div>
                {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                </Card>
            ))}
            </div>
          </ScrollArea>
          {form.formState.errors.items && <p className="text-sm font-medium text-destructive">{form.formState.errors.items.message}</p>}
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full !mt-8">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Salvando...' : 'Salvar Registro de Manutenção'}
        </Button>
      </form>
    </Form>
  );
}

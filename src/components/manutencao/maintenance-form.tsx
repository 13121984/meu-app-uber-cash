
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Loader2, CheckCircle, AlertTriangle, BellRing, Lock, Wrench, ShieldQuestion } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { addMaintenance, updateMaintenance } from '@/services/maintenance.service';
import type { Maintenance as MaintenanceType } from '@/services/maintenance.service';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export const maintenanceSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres.").max(100, "A descrição não pode ter mais de 100 caracteres."),
  type: z.enum(['preventive', 'corrective', 'both'], { required_error: "Selecione o tipo de manutenção."}),
  amount: z.number().min(0.01, "O valor deve ser maior que zero."),
  kmAtService: z.number().nullable(),
  reminderKm: z.number().nullable(),
  reminderDate: z.date().nullable(),
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
        reminderDate: initialData.reminderDate ? new Date(initialData.reminderDate) : null,
     } : {
      date: new Date(),
      description: '',
      type: 'corrective',
      amount: 0,
      kmAtService: null,
      reminderKm: null,
      reminderDate: null,
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let result;
      const dataToSend = { ...data };

      if (initialData?.id) {
        result = await updateMaintenance(user.id, initialData.id, dataToSend);
      } else {
        result = await addMaintenance(user.id, dataToSend);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Troca de óleo e filtros" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2"><ShieldQuestion className="w-4 h-4 text-primary"/>Tipo de Manutenção</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 flex-1 p-4 border rounded-md has-[:checked]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="preventive" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Preventiva <span className="block text-xs text-muted-foreground">Troca programada (óleo, filtro, etc.)</span>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 flex-1 p-4 border rounded-md has-[:checked]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="corrective" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Corretiva <span className="block text-xs text-muted-foreground">Reparo inesperado (peça quebrou)</span>
                    </FormLabel>
                  </FormItem>
                   <FormItem className="flex items-center space-x-3 space-y-0 flex-1 p-4 border rounded-md has-[:checked]:border-primary">
                    <FormControl>
                      <RadioGroupItem value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Ambas <span className="block text-xs text-muted-foreground">Fez uma preventiva e corrigiu algo.</span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        placeholder="150,00" 
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                     />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                <FormLabel>Data do Serviço</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
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
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Separator />
        
        {/* Reminder section */}
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-primary" />
                    Lembrete de Manutenção
                 </h3>
                 {!isAutopilot && <Link href="/premium"><Button variant="link" size="sm" className="text-amber-500"><Lock className="mr-1 h-3 w-3"/> Autopilot</Button></Link>}
            </div>
            
             <FormField
                control={form.control}
                name="kmAtService"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>KM no momento do serviço</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            placeholder="Ex: 85000" 
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(parseInt(e.target.value) || null)}
                            disabled={!isAutopilot}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="reminderKm"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lembrar após (KM)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Ex: 10000" 
                                {...field}
                                value={field.value || ''}
                                onChange={e => field.onChange(parseInt(e.target.value) || null)}
                                disabled={!isAutopilot}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="reminderDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                        <FormLabel>Lembrar em (Data)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                 disabled={!isAutopilot}
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
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={ptBR}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
        </Button>
      </form>
    </Form>
  );
}

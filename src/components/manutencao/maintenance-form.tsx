
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { addMaintenance, updateMaintenance } from '@/services/maintenance.service';
import type { Maintenance as MaintenanceType } from '@/services/maintenance.service';


// Define o schema e o tipo aqui, no componente do cliente
export const maintenanceSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres.").max(100, "A descrição não pode ter mais de 100 caracteres."),
  amount: z.number().min(0.01, "O valor deve ser maior que zero."),
});

// Remove o userId do tipo Zod, pois ele vem do servidor
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

// O tipo para o formulário e onSuccess precisa do ID opcional, mas não do userId
type FormAndSuccessType = Omit<MaintenanceType, 'userId'>

interface MaintenanceFormProps {
  initialData: FormAndSuccessType | null;
  onSuccess: (record: FormAndSuccessType) => void;
}

export function MaintenanceForm({ initialData, onSuccess }: MaintenanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: initialData || {
      date: new Date(),
      description: '',
      amount: 0,
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      // Dados a serem enviados para o backend (sem id)
      const dataToSend = { date: data.date, description: data.description, amount: data.amount };

      if (initialData?.id) {
        // Editando
        result = await updateMaintenance(initialData.id, dataToSend);
      } else {
        // Adicionando
        result = await addMaintenance(dataToSend);
      }

      if (result.success) {
        toast({
          title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>,
          description: `Registro ${initialData ? 'atualizado' : 'adicionado'}.`,
        });
        
        // O onSuccess espera um objeto com id, mas sem userId
        const returnedRecord = { ...data, id: initialData?.id ?? result.id };
        onSuccess(returnedRecord);

      } else {
        throw new Error(result.error);
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
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
        </Button>
      </form>
    </Form>
  );
}

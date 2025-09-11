
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
import { CalendarIcon, Loader2, CheckCircle, AlertTriangle, List } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { addPersonalExpense, updatePersonalExpense, PersonalExpense } from '@/services/personal-expense.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '@/contexts/auth-context';

export const personalExpenseSchema = z.object({
  id: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  description: z.string().min(3, "A descrição precisa ter pelo menos 3 caracteres.").max(100, "A descrição não pode ter mais de 100 caracteres."),
  category: z.string({ required_error: "A categoria é obrigatória." }),
  amount: z.number().min(0.01, "O valor deve ser maior que zero."),
});

export type PersonalExpenseFormData = z.infer<typeof personalExpenseSchema>;

interface PersonalExpenseFormProps {
  initialData: PersonalExpense | null;
  categories: string[];
  onSuccess: (record: PersonalExpense) => void;
}

const defaultFormValues = (categories: string[]) => ({
      date: new Date(),
      description: '',
      category: categories[0] || '',
      amount: 0,
});


export function PersonalExpenseForm({ initialData, categories, onSuccess }: PersonalExpenseFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PersonalExpenseFormData>({
    resolver: zodResolver(personalExpenseSchema),
    defaultValues: initialData ? { ...initialData, date: new Date(initialData.date) } : defaultFormValues(categories),
  });
  
  // Efeito para resetar o formulário quando o `initialData` mudar (ex: ao editar um item e depois adicionar um novo)
  React.useEffect(() => {
    if (initialData) {
        form.reset({ ...initialData, date: new Date(initialData.date) });
    } else {
        form.reset(defaultFormValues(categories));
    }
  }, [initialData, form, categories]);

  const onSubmit = async (data: PersonalExpenseFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let result;
      const dataToSend = { ...data };

      if (initialData?.id) {
        result = await updatePersonalExpense(user.id, initialData.id, dataToSend);
      } else {
        result = await addPersonalExpense(user.id, dataToSend);
      }

      if (result.success && result.id) {
        toast({
          title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>,
          description: `Despesa ${initialData ? 'atualizada' : 'adicionada'}.`,
        });
        
        const returnedRecord = { ...data, id: result.id };
        onSuccess(returnedRecord as PersonalExpense);
        
        // Limpa o formulário para a próxima entrada, mas mantém a janela aberta
        if(!initialData) {
           form.reset(defaultFormValues(categories));
        }

      } else {
        throw new Error(result.error || "Ocorreu um erro desconhecido.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar a despesa.";
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
                <Textarea placeholder="Ex: Almoço, conta de luz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50,00" 
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data da Despesa</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                      date < new Date("1900-01-01")
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
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
        </Button>
      </form>
    </Form>
  );
}

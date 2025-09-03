
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, CheckCircle, AlertTriangle, Loader2, Target } from 'lucide-react';
import { toast } from "@/hooks/use-toast"
import { Goals, saveGoals } from '@/services/goal.service';
import { useRouter } from 'next/navigation';


const goalsSchema = z.object({
  daily: z.number().min(0, "A meta deve ser um valor positivo."),
  weekly: z.number().min(0, "A meta deve ser um valor positivo."),
  monthly: z.number().min(0, "A meta deve ser um valor positivo."),
});

interface GoalFormProps {
  initialData: Goals;
}

export function GoalForm({ initialData }: GoalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Goals>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      daily: initialData.daily || 0,
      weekly: initialData.weekly || 0,
      monthly: initialData.monthly || 0,
    },
  });

  const onSubmit = async (data: Goals) => {
    setIsSubmitting(true);
    try {
      await saveGoals(data);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-bold">Metas Salvas!</span>
          </div>
        ),
        description: "Suas novas metas foram salvas com sucesso.",
      });
       // Força a revalidação dos dados no dashboard
      router.refresh(); 
    } catch (error) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-bold">Erro ao Salvar!</span>
          </div>
        ),
        description: "Não foi possível salvar suas metas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <span>Defina suas Metas de Lucro</span>
          </CardTitle>
          <CardDescription>
            Insira os valores que você deseja alcançar. Essas metas serão usadas no seu dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily">Meta Diária</Label>
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Controller
                    name="daily"
                    control={control}
                    render={({ field }) => (
                        <Input
                        id="daily"
                        type="number"
                        placeholder="Ex: 200"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        />
                    )}
                />
            </div>
            {errors.daily && <p className="text-sm text-destructive">{errors.daily.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weekly">Meta Semanal</Label>
             <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Controller
                    name="weekly"
                    control={control}
                    render={({ field }) => (
                        <Input
                        id="weekly"
                        type="number"
                        placeholder="Ex: 1000"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        />
                    )}
                />
            </div>
            {errors.weekly && <p className="text-sm text-destructive">{errors.weekly.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Meta Mensal</Label>
             <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Controller
                    name="monthly"
                    control={control}
                    render={({ field }) => (
                        <Input
                        id="monthly"
                        type="number"
                        placeholder="Ex: 4000"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        className="pl-10"
                        />
                    )}
                />
            </div>
            {errors.monthly && <p className="text-sm text-destructive">{errors.monthly.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             {isSubmitting ? 'Salvando...' : 'Salvar Metas'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

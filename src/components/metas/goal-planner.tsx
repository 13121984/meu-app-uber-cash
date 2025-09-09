
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, CheckCircle, AlertTriangle, Loader2, Target, Calendar, Info, BarChart3, LineChart } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Goals, saveGoals, getGoals } from '@/services/goal.service';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '@/contexts/auth-context';


const plannerSchema = z.object({
  monthly: z.number().min(1, "A meta mensal deve ser maior que zero."),
  workDaysPerWeek: z.number().min(1).max(7),
});

type PlannerFormData = z.infer<typeof plannerSchema>;

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function GoalPlannerSkeleton() {
    return (
        <div className="space-y-4">
             <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex justify-end">
                 <Skeleton className="h-10 w-36" />
            </div>
        </div>
    );
}

function PlannerInternal({ initialData }: { initialData: Goals }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PlannerFormData>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      monthly: initialData.monthly || 4000,
      workDaysPerWeek: initialData.workDaysPerWeek || 6,
    },
  });

  const { watch, control } = form;
  const monthlyGoal = watch('monthly');
  const workDaysPerWeek = watch('workDaysPerWeek');

  const calculatedGoals = useMemo(() => {
      const weekly = monthlyGoal / 4; // Aproximação de 4 semanas no mês
      const daily = workDaysPerWeek > 0 ? weekly / workDaysPerWeek : 0;
      return { daily, weekly };
  }, [monthlyGoal, workDaysPerWeek]);

  const onSubmit = async (data: PlannerFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const finalGoals: Goals = {
          monthly: data.monthly,
          weekly: calculatedGoals.weekly,
          daily: calculatedGoals.daily,
          workDaysPerWeek: data.workDaysPerWeek,
      }
      await saveGoals(user.id, finalGoals);
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Metas Salvas!</span></div>,
        description: "Seu novo plano de metas foi salvo e será usado no dashboard.",
      });
      router.refresh(); 
    } catch (error) {
      toast({
        title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro ao Salvar</span></div>,
        description: "Não foi possível salvar suas metas.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-primary/10 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
               Aqui você define o valor **livre** que quer ter por mês, ou seja, após tirar seus custos de trabalho (combustível, etc).
            </AlertDescription>
        </Alert>
        <div className="space-y-2">
            <Label htmlFor="monthly" className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground"/>Meta Mensal de Lucro</Label>
            <Controller
                name="monthly"
                control={control}
                render={({ field }) => (
                    <Input
                        id="monthly" type="number" placeholder="Ex: 4000"
                        value={field.value === 0 ? '' : field.value}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                )}
            />
             {form.formState.errors.monthly && <p className="text-sm text-destructive">{form.formState.errors.monthly.message}</p>}
        </div>
        <div className="space-y-2">
             <Label htmlFor="workDaysPerWeek" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground"/>Carga de Trabalho</Label>
             <Controller
                name="workDaysPerWeek"
                control={control}
                render={({ field }) => (
                     <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                        <SelectTrigger id="workDaysPerWeek">
                            <SelectValue placeholder="Selecione os dias..."/>
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(7)].map((_, i) => (
                                <SelectItem key={i+1} value={String(i+1)}>{i+1} dias / sem.</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
             />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
             <Card className="text-center p-4 bg-secondary">
                <CardDescription className="flex items-center justify-center gap-2"><LineChart className="w-4 h-4"/>Meta Semanal</CardDescription>
                <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedGoals.weekly)}</p>
             </Card>
             <Card className="text-center p-4 bg-secondary">
                <CardDescription className="flex items-center justify-center gap-2"><BarChart3 className="w-4 h-4"/>Meta Diária</CardDescription>
                <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedGoals.daily)}</p>
             </Card>
        </div>
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Salvando...' : 'Salvar Plano'}
            </Button>
        </div>
    </form>
  );
}

export function GoalPlanner() {
    const { user, loading } = useAuth();
    const [initialData, setInitialData] = useState<Goals | null>(null);

    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            const goals = await getGoals(user.id);
            setInitialData(goals);
        };
        loadData();
    }, [user]);

    if (loading || !initialData) {
        return <GoalPlannerSkeleton />;
    }

    return <PlannerInternal initialData={initialData} />;
}


"use client";

import React, { useState, useReducer, useEffect } from 'react';
import { Check, Loader2, CheckCircle, AlertTriangle, Edit, Trash2, PlusCircle, Car, MapPin, DollarSign, Gauge, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Step1Info } from './step1-info';
import { Step2Earnings } from './step2-earnings';
import { Step3Fuel } from './step3-fuel';
import { LivePreview } from './live-preview';
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { parseISO, startOfDay } from 'date-fns';
import type { WorkDay } from '@/services/work-day.service';
import { updateWorkDayAction, deleteWorkDayEntryAction } from '@/app/gerenciamento/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getCatalog, Catalog } from '@/services/catalog.service';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';


const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };
export type MaintenanceEntry = { id: number; description: string; amount: number };

export type TimeEntry = {
    id: number;
    start: string;
    end: string;
};

export type State = {
  id?: string;
  date: Date;
  km: number;
  hours: number;
  timeEntries: TimeEntry[];
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenanceEntries: MaintenanceEntry[];
};

type Action =
  | { type: 'SET_STATE'; payload: State }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } }
  | { type: 'RESET_STATE'; payload: { registrationType: 'today' | 'other-day' }};


const getInitialState = (initialData?: Partial<WorkDay>, registrationType: 'today' | 'other-day' = 'today'): State => {
    let date;
    if(initialData?.date) {
        date = typeof initialData.date === 'string' ? parseISO(initialData.date) : initialData.date;
    } else {
        date = registrationType === 'today' ? startOfDay(new Date()) : new Date(); // Use new Date() for 'other-day' to allow user input
    }

    return {
        id: initialData?.id || undefined,
        date: date,
        km: initialData?.km || 0,
        hours: initialData?.hours || 0,
        timeEntries: (initialData as any)?.timeEntries?.map((t: TimeEntry) => ({...t})) || [],
        earnings: initialData?.earnings?.map(e => ({...e})) || [],
        fuelEntries: initialData?.fuelEntries?.map(f => ({...f})) || [],
        maintenanceEntries: initialData?.maintenanceEntries || [],
    };
};


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STATE': 
        return action.payload;
    case 'UPDATE_FIELD': 
        return { ...state, [action.payload.field]: action.payload.value };
    case 'RESET_STATE': 
        return getInitialState(undefined, action.payload.registrationType);
    default: 
        return state;
  }
}

const steps = [
  { id: 1, title: 'Dados Básicos', icon: Car },
  { id: 2, title: 'Ganhos', icon: DollarSign },
  { id: 3, title: 'Despesas', icon: Gauge },
];

interface RegistrationWizardProps {
    initialData?: Partial<WorkDay> | null;
    isEditing?: boolean;
    onSuccess?: () => void;
    registrationType?: 'today' | 'other-day';
    existingDayEntries?: WorkDay[];
}


function WizardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
}

export function RegistrationWizard({ initialData: propsInitialData, isEditing = false, onSuccess, registrationType = 'today', existingDayEntries: propsExistingEntries }: RegistrationWizardProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, dispatch] = useReducer(reducer, getInitialState(propsInitialData || undefined, registrationType));
  
  const [existingEntries, setExistingEntries] = useState<WorkDay[]>(propsExistingEntries || []);
  const [entryBeingEdited, setEntryBeingEdited] = useState<WorkDay | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);


   useEffect(() => {
    setExistingEntries(propsExistingEntries || []);
   }, [propsExistingEntries]);
   
   useEffect(() => {
    if (entryBeingEdited) {
        dispatch({ type: 'SET_STATE', payload: getInitialState(entryBeingEdited, registrationType) });
    } else if (propsInitialData) {
        dispatch({ type: 'SET_STATE', payload: getInitialState(propsInitialData, registrationType) });
    } else {
        dispatch({ type: 'RESET_STATE', payload: { registrationType }});
    }
   }, [entryBeingEdited, registrationType, propsInitialData]);
   
   useEffect(() => {
       const fetchCatalog = async () => {
           const catalogData = await getCatalog();
           setCatalog(catalogData);
       }
       fetchCatalog();
   }, []);


  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    if (!state.date) {
        toast({
            title: "Data Inválida",
            description: "Por favor, selecione uma data válida antes de salvar.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);
    
    try {
      const { maintenanceEntries, ...workDayData } = state;
      // Use the server action to ensure sequential updates
      const result = await updateWorkDayAction(user.id, workDayData as WorkDay);
      
      if (result.success) {
        toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>,
            description: `Seu período de trabalho foi ${result.operation === 'updated' ? 'atualizado' : 'registrado'}.`,
        });
        
        if (onSuccess) {
            onSuccess();
        } else {
            router.push('/'); 
            router.refresh(); 
        }

      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : `Não foi possível ${isEditing ? 'atualizar' : 'registrar'} seu dia de trabalho.`;
      toast({
          title: <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /><span>Erro ao Salvar!</span></div>,
          description: errorMessage,
          variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDeleteEntry = async (id: string) => {
      if (!user) return;
      setDeletingId(id);
      const result = await deleteWorkDayEntryAction(user.id, id);
      if (result.success) {
          toast({ description: "Período removido com sucesso."});
          router.refresh();
      } else {
          toast({ description: `Erro ao remover período: ${result.error}`, variant: "destructive" });
      }
      setDeletingId(null);
      setIsAlertOpen(false);
  };

  if (!catalog) {
      return <WizardSkeleton />;
  }

  const activeEarningCategories = catalog.earnings.filter(c => c.active);
  const activeFuelCategories = catalog.fuel.filter(c => c.active);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1Info data={state} dispatch={dispatch} isEditing={!!entryBeingEdited || isEditing} registrationType={registrationType}/>;
      case 2: return <Step2Earnings data={state} dispatch={dispatch} categories={activeEarningCategories} />;
      case 3: return <Step3Fuel data={state} dispatch={dispatch} fuelTypes={activeFuelCategories} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === steps.length;
  const livePreviewData = state;

  return (
    <div className="space-y-6">
        
        {registrationType === 'today' && existingEntries.length > 0 && !entryBeingEdited && (
            <Card>
                <CardHeader>
                    <CardTitle>Períodos Registrados Hoje</CardTitle>
                     <CardDescription>
                        Você pode editar um período ou adicionar um novo abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {existingEntries.map(entry => {
                        const profit = entry.earnings.reduce((sum, e) => sum + e.amount, 0) - entry.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
                        return (
                             <AlertDialog key={entry.id}>
                                <div className="p-2 flex justify-between items-center bg-secondary rounded-md">
                                    <div>
                                        <p className="font-semibold">{entry.timeEntries.map(t => `${t.start}-${t.end}`).join(', ') || `${entry.hours.toFixed(1)}h`}</p>
                                        <p className="text-sm text-green-500">{formatCurrency(profit)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => setEntryBeingEdited(entry)}><Pencil className="h-4 w-4" /></Button>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                    </div>
                                </div>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja apagar este período de trabalho?
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} className="bg-destructive hover:bg-destructive/80">
                                        {deletingId === entry.id ? <Loader2 className="animate-spin" /> : "Apagar"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    })}
                </CardContent>
            </Card>
        )}

        <Card>
             <CardHeader>
                <CardTitle className="font-headline">{entryBeingEdited ? 'Editando Período' : 'Novo Registro'}</CardTitle>
                <CardDescription>Percorra a estrada do registro em {steps.length} etapas.</CardDescription>
                {/* Stepper */}
                <div className="pt-4">
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const isCompleted = currentStep > index + 1;
                                const isCurrent = currentStep === index + 1;
                                return (
                                    <motion.div 
                                      key={step.id} 
                                      className="flex flex-col items-center z-10"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                            isCurrent ? "bg-primary border-primary text-primary-foreground animate-float" : 
                                            isCompleted ? "bg-green-500 border-green-500 text-white" :
                                            "bg-background border-border text-muted-foreground"
                                        )}>
                                            {isCompleted ? <Check /> : <step.icon className="h-5 w-5"/>}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                     <div className="text-center mt-2">
                        <p className="font-semibold">Etapa {currentStep} de {steps.length}: {steps[currentStep-1].title}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderStepContent()}
            </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
            {entryBeingEdited ? (
                <Button variant="outline" onClick={() => setEntryBeingEdited(null)} disabled={isSubmitting}>
                    Cancelar Edição
                </Button>
            ) : (
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                    Voltar
                </Button>
            )}

            <div className="flex gap-2">
                {!isLastStep ? (
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        Próximo
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditing || entryBeingEdited ? 'Salvar Alterações' : 'Concluir e Salvar'}
                    </Button>
                )}
            </div>
        </div>

      <LivePreview data={livePreviewData as State} />
    </div>
  );
}

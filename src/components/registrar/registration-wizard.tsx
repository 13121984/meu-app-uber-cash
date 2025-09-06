

"use client";

import React, { useState, useReducer, useEffect } from 'react';
import { Check, Loader2, CheckCircle, AlertTriangle, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Step1Info } from './step1-info';
import { Step2Earnings } from './step2-earnings';
import { Step3Fuel } from './step3-fuel';
import { LivePreview } from './live-preview';
import { toast } from "@/hooks/use-toast"
import { addOrUpdateWorkDay, deleteWorkDayEntry } from '@/services/work-day.service';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { parseISO, startOfDay } from 'date-fns';
import type { WorkDay } from '@/services/work-day.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };

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
  { id: 1, title: 'Informações' },
  { id: 2, title: 'Ganhos' },
  { id: 3, title: 'Combustível' },
];

interface RegistrationWizardProps {
    initialData?: Partial<WorkDay> | null;
    isEditing?: boolean;
    onSuccess?: () => void;
    registrationType: 'today' | 'other-day';
    existingDayEntries?: WorkDay[];
}

const cashRegisterSound = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABoR2tGYWFFAAAAAPcAAAN3AAAAAAAAAFl+ZWW3s1sLdGAAAAAAAAAIjbQBAAAAAAEAAAIiUKgZn3oAAAGPBAEABAAgAAEABpVoaWdodG9uZQAAAAAAbHVrYXNhbG1lbnRpbmVsbG9nYW5kZXZAAAAAAP/7QMQAAAAAAAAAAAAAAAAAAAAAAARsYXZjNTguOTEuMTAwBICAgAgAgIAHAAACAET/wkAAASIgaJkAMgAABwAAAnQCkQhEAEQwBIDS8AAAAAAD/8A/wD4AAAAA//pAQHwAAAAEwADAnQAAAD/8A/wDwAAAAAABYhEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAGYlEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAGolEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wD4AAAAAAIAAAAAAAAggAB/AAD//dAwAAMAAAN4AAANIAAD/9gYBAkAAjSRgYhL//dAwLAAKAAAN4AAANIAAD/9gYBAkAEDSRgYhL//dAwqQAnAAAN4AAANIAAD/9gYBAkAEzSRgYhL//dAwjQCPAAAN4AAANIAAD/9gYBAkAFDS.";

const playSuccessSound = () => {
    if (typeof window !== 'undefined') {
        const audio = new Audio(cashRegisterSound);
        audio.play().catch(error => {
            console.error("Audio playback failed:", error);
        });
    }
}


export function RegistrationWizard({ initialData: propsInitialData, isEditing = false, onSuccess, registrationType, existingDayEntries: propsExistingEntries }: RegistrationWizardProps) {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(isEditing ? [1,2,3] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, dispatch] = useReducer(reducer, getInitialState(propsInitialData || undefined, registrationType));
  
  // Novo estado para gerenciar os períodos existentes
  const [existingEntries, setExistingEntries] = useState<WorkDay[]>(propsExistingEntries || []);
  const [entryBeingEdited, setEntryBeingEdited] = useState<WorkDay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);


   useEffect(() => {
    setExistingEntries(propsExistingEntries || []);
   }, [propsExistingEntries]);
   
   useEffect(() => {
    if (entryBeingEdited) {
        // Se estamos editando uma entrada, preenchemos o formulário com seus dados
        dispatch({ type: 'SET_STATE', payload: getInitialState(entryBeingEdited, registrationType) });
        setCompletedSteps([1,2,3]); // Marcamos todos os passos como "completos" para facilitar a edição
    } else {
        // Se não, resetamos para um novo registro
        const dateToUse = registrationType === 'today' ? startOfDay(new Date()) : propsInitialData?.date;
        dispatch({ type: 'SET_STATE', payload: getInitialState({ date: dateToUse }, registrationType) });
        setCompletedSteps([]);
    }
   }, [entryBeingEdited, registrationType, propsInitialData]);


  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) {
      setCurrentStep(step);
    }
  };
  
  const handleSubmit = async () => {
    if (!state.date) {
        toast({
            title: "Data Inválida",
            description: "Por favor, selecione uma data válida antes de salvar.",
            variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);
    if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
    }
    
    try {
      const { ...workDayData } = state;
      const isActuallyEditing = !!workDayData.id && !['today', 'other-day'].includes(workDayData.id);
      
      const result = await addOrUpdateWorkDay(workDayData as WorkDay);
      
      if (result.success) {
        if (!isActuallyEditing) {
          playSuccessSound();
        }
        toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Sucesso!</span></div>,
            description: `Seu período de trabalho foi ${result.operation === 'updated' ? 'atualizado' : 'registrado'}.`,
        });
        
        if (onSuccess) {
            onSuccess();
        } else {
            // Cancelar edição
            setEntryBeingEdited(null);
            // Limpa o formulário para um novo registro
            dispatch({ type: 'RESET_STATE', payload: { registrationType }});
            setCurrentStep(1);
            setCompletedSteps([]);
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
      const result = await deleteWorkDayEntry(id);
      if (result.success) {
          toast({ description: "Período removido com sucesso."});
          router.refresh(); // Recarrega os dados do servidor
      } else {
          toast({ description: `Erro ao remover período: ${result.error}`, variant: "destructive" });
      }
  };

  const handleDeleteAllEntries = async () => {
    setIsDeleting(true);
    const deletePromises = existingEntries.map(entry => deleteWorkDayEntry(entry.id));
    
    try {
      await Promise.all(deletePromises);
      toast({ title: "Sucesso!", description: "Todos os períodos de hoje foram removidos." });
      router.refresh(); 
    } catch (error) {
      toast({ title: "Erro!", description: "Não foi possível apagar todos os períodos.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false); 
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Info data={state} dispatch={dispatch} isEditing={!!entryBeingEdited || isEditing} registrationType={registrationType}/>;
      case 2: return <Step2Earnings data={state} dispatch={dispatch} />;
      case 3: return <Step3Fuel data={state} dispatch={dispatch} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === steps.length;
  const livePreviewData = state;

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="flex flex-col space-y-6 lg:col-span-2">
        
        {registrationType === 'today' && existingEntries.length > 0 && !entryBeingEdited && (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Períodos Registrados Hoje</CardTitle>
                        {existingEntries.length > 1 && (
                            <Button variant="destructive" size="sm" onClick={() => setIsAlertOpen(true)} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                <span className="ml-2">Apagar Tudo</span>
                            </Button>
                        )}
                    </div>
                     <CardDescription>
                        Você pode editar um período ou adicionar um novo abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {existingEntries.map(entry => {
                        const profit = entry.earnings.reduce((sum, e) => sum + e.amount, 0) - entry.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
                        return (
                            <Card key={entry.id} className="p-2 flex justify-between items-center bg-secondary">
                                <div>
                                    <p className="font-semibold">{entry.timeEntries.map(t => `${t.start}-${t.end}`).join(', ') || `${entry.hours.toFixed(1)}h`}</p>
                                    <p className="text-sm text-green-500">{formatCurrency(profit)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => setEntryBeingEdited(entry)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteEntry(entry.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
        )}

        <div className="flex flex-col space-y-6">
            <div className="hidden sm:flex items-center justify-between p-4 border rounded-lg">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => goToStep(step.id)}>
                    <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        currentStep === step.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : completedSteps.includes(step.id)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-muted border-muted-foreground'
                    }`}
                    >
                    {completedSteps.includes(step.id) && currentStep !== step.id ? <Check /> : step.id}
                    </div>
                    <p className={`mt-2 text-sm ${currentStep === step.id ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                    </p>
                </div>
                {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-border" />}
                </React.Fragment>
            ))}
            </div>
            
            <Card className="flex-1 flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">{entryBeingEdited ? 'Editando Período' : (isEditing ? 'Editar Registro' : 'Novo Período')}</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[60vh] overflow-y-auto">
                <CardContent className="p-4 sm:p-6">
                    {renderStep()}
                </CardContent>
                </ScrollArea>
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
        </div>
      </div>

      <div className="lg:col-span-1">
        <LivePreview data={livePreviewData as State} />
      </div>
    </div>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente <b>TODOS</b> os períodos de trabalho registrados hoje.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllEntries} 
              disabled={isDeleting} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Apagando..." : "Sim, apagar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    
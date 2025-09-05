
"use client";

import React, { useState, useReducer, useEffect } from 'react';
import { Check, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Step1Info } from './step1-info';
import { Step2Earnings } from './step2-earnings';
import { Step3Fuel } from './step3-fuel';
import { Step4Extras } from './step4-extras';
import { LivePreview } from './live-preview';
import { toast } from "@/hooks/use-toast"
import { addOrUpdateWorkDay, findWorkDayByDate } from '@/services/work-day.service';
import { addMaintenance } from '@/services/maintenance.service';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { parseISO, format } from 'date-fns';
import type { WorkDay } from '@/services/work-day.service';

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };

export type TimeEntry = {
    id: number;
    start: string;
    end: string;
};

type State = {
  id?: string;
  date: Date;
  km: number;
  hours: number;
  timeEntries: TimeEntry[];
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenance: { description: string; amount: number };
};

type Action =
  | { type: 'SET_STATE'; payload: State }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof State; value: any } }
  | { type: 'RESET_STATE' };


const getInitialState = (initialData?: Partial<WorkDay>): State => {
    let date = new Date();
    if(initialData?.date) {
        date = typeof initialData.date === 'string' ? parseISO(initialData.date) : initialData.date;
    }

    return {
        id: initialData?.id || undefined,
        date,
        km: initialData?.km || 0,
        hours: initialData?.hours || 0,
        timeEntries: (initialData as any)?.timeEntries || [],
        earnings: initialData?.earnings || [],
        fuelEntries: initialData?.fuelEntries || [],
        maintenance: initialData?.maintenance || { description: '', amount: 0 },
    };
};


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STATE': 
        return action.payload;
    case 'UPDATE_FIELD': 
        return { ...state, [action.payload.field]: action.payload.value };
    case 'RESET_STATE': 
        return getInitialState();
    default: 
        return state;
  }
}

const steps = [
  { id: 1, title: 'Informações do Dia' },
  { id: 2, title: 'Ganhos' },
  { id: 3, title: 'Abastecimentos' },
  { id: 4, title: 'Despesas Extras' },
];

interface RegistrationWizardProps {
    initialData?: Partial<WorkDay>;
    isEditing?: boolean;
    onSuccess?: () => void;
    registrationType?: 'today' | 'other-day';
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


export function RegistrationWizard({ initialData, isEditing = false, onSuccess, registrationType = 'other-day' }: RegistrationWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(isEditing ? [1,2,3,4] : []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, dispatch] = useReducer(reducer, getInitialState(initialData));
  
  useEffect(() => {
    // When not editing, check for an existing workday for the selected date
    if (!isEditing && state.date) {
        const fetchExistingData = async () => {
            const dateStr = format(state.date, 'yyyy-MM-dd');
            const existingDay = await findWorkDayByDate(dateStr);
            if (existingDay) {
                // If a day is found, merge its data into the current state
                dispatch({ 
                    type: 'SET_STATE', 
                    payload: getInitialState(existingDay)
                });
            }
        };
        fetchExistingData();
    } else if (isEditing && initialData) {
        dispatch({ type: 'SET_STATE', payload: getInitialState(initialData) })
    }
  }, [state.date, isEditing, initialData]);


  const resetWizard = () => {
    dispatch({ type: 'RESET_STATE' });
    setCurrentStep(1);
    setCompletedSteps([]);
  };

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
      const { maintenance, ...workDayData } = state;
      const result = await addOrUpdateWorkDay(workDayData as Omit<WorkDay, 'maintenance'>);
      
      if (!isEditing && result.success && maintenance.amount > 0 && maintenance.description) {
          await addMaintenance({
              date: state.date,
              description: maintenance.description,
              amount: maintenance.amount,
          });
      }
      
      if (result.success) {
        if (!isEditing) {
          playSuccessSound();
        }
        toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold">Sucesso!</span>
              </div>
            ),
            description: `Seu dia de trabalho foi ${result.operation === 'updated' ? 'atualizado' : 'registrado'}.`,
            variant: "default",
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
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-bold">Erro ao Salvar!</span>
            </div>
          ),
          description: errorMessage,
          variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Info data={state} dispatch={dispatch} registrationType={registrationType} isEditing={isEditing}/>;
      case 2: return <Step2Earnings data={state} dispatch={dispatch} />;
      case 3: return <Step3Fuel data={state} dispatch={dispatch} />;
      case 4: return <Step4Extras data={state} dispatch={dispatch} isDisabled={isEditing} />;
      default: return null;
    }
  };

  const isStep1Or2 = currentStep === 1 || currentStep === 2;
  const isStep3 = currentStep === 3;
  const isLastStep = currentStep === steps.length;
  const livePreviewData = state;

  return (
    <div className={`grid grid-cols-1 ${isEditing ? '' : 'lg:grid-cols-3'} gap-8`}>
      <div className={`flex flex-col space-y-6 ${isEditing ? '' : 'lg:col-span-2'}`}>
        {/* Stepper */}
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

        {/* Step Content */}
        <Card className="flex-1 flex flex-col">
           <ScrollArea className="h-[60vh] overflow-y-auto">
              <CardContent className="p-4 sm:p-6">
                {renderStep()}
              </CardContent>
            </ScrollArea>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                Voltar
            </Button>

            <div className="flex gap-2">
                {!isLastStep && (
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        Próximo
                    </Button>
                )}

                {isLastStep && (
                     <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditing ? 'Salvar Alterações' : 'Concluir e Salvar'}
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* Live Preview */}
       {!isEditing && (
         <div className="lg:col-span-1">
            <LivePreview data={livePreviewData as State} />
         </div>
       )}
    </div>
  );
}


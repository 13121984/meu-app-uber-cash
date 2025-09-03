"use client";

import React, { useState, useReducer } from 'react';
import { Check, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Step1Info } from './step1-info';
import { Step2Earnings } from './step2-earnings';
import { Step3Fuel } from './step3-fuel';
import { Step4Extras } from './step4-extras';
import { LivePreview } from './live-preview';
import { toast } from "@/hooks/use-toast"
import { addWorkDay } from '@/services/work-day.service';

export type Earning = { id: number; category: string; trips: number; amount: number };
export type FuelEntry = { id: number; type: string; paid: number; price: number };

type State = {
  date: Date;
  km: number;
  hours: number;
  earnings: Earning[];
  fuelEntries: FuelEntry[];
  maintenance: { description: string; amount: number };
};

type Action =
  | { type: 'SET_BASIC_INFO'; payload: { date: Date; km: number; hours: number } }
  | { type: 'SET_EARNINGS'; payload: Earning[] }
  | { type: 'SET_FUEL'; payload: FuelEntry[] }
  | { type: 'SET_MAINTENANCE'; payload: { description: string; amount: number } };

const initialState: State = {
  date: new Date(),
  km: 0,
  hours: 0,
  earnings: [],
  fuelEntries: [],
  maintenance: { description: '', amount: 0 },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_BASIC_INFO': return { ...state, ...action.payload };
    case 'SET_EARNINGS': return { ...state, earnings: action.payload };
    case 'SET_FUEL': return { ...state, fuelEntries: action.payload };
    case 'SET_MAINTENANCE': return { ...state, maintenance: action.payload };
    default: return state;
  }
}

const steps = [
  { id: 1, title: 'Informações do Dia' },
  { id: 2, title: 'Ganhos' },
  { id: 3, title: 'Abastecimentos' },
  { id: 4, title: 'Despesas Extras' },
];

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);

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
    setIsSubmitting(true);
    if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
    }
    
    try {
      const result = await addWorkDay(state);

      if (result.success) {
        toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-bold">Sucesso!</span>
              </div>
            ),
            description: "Seu dia de trabalho foi registrado.",
            variant: "default",
        });
        // You can reset the form or redirect the user here
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast({
          title: (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-bold">Erro ao Salvar!</span>
            </div>
          ),
          description: "Não foi possível registrar seu dia de trabalho. Tente novamente.",
          variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Info data={state} dispatch={dispatch} />;
      case 2: return <Step2Earnings data={state} dispatch={dispatch} />;
      case 3: return <Step3Fuel data={state} dispatch={dispatch} />;
      case 4: return <Step4Extras data={state} dispatch={dispatch} />;
      default: return null;
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
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
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
            Voltar
          </Button>
          {!isLastStep ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Próximo
            </Button>
          ) : (
             <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
            </Button>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-1">
        <LivePreview data={state} />
      </div>
    </div>
  );
}

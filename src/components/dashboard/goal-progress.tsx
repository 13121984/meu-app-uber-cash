
"use client"

import React, { useEffect } from 'react';
import { Car, Target, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  const { toast } = useToast();

  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  useEffect(() => {
    if (isComplete) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5"/><span>Meta Atingida!</span></div>,
        description: "Você conseguiu! Continue acelerando para o próximo objetivo!",
        variant: "success",
      });
    }
  }, [isComplete, toast]);
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const remaining = target - current;

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4">
      
      <div className="w-full px-1">
        <div className="relative h-2 w-full bg-muted rounded-full">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${clampedProgress}%`}}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `calc(${clampedProgress}% - 16px)` }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
              <Car
                className="h-6 w-6 text-primary"
                fill="currentColor"
              />
            </div>
          </div>
           <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
           <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-card rounded-full border-2 border-foreground flex items-center justify-center">
             <Target className="h-3 w-3 text-foreground" />
           </div>
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-lg text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(current)} de {formatCurrency(target)}
        </p>
         {remaining > 0 && !isComplete && (
          <p className="text-xs text-yellow-400 mt-2">Faltam {formatCurrency(remaining)} para sua meta</p>
        )}
        {isComplete && (
            <p className="text-xs text-green-400 font-semibold mt-2">Parabéns, meta concluída!</p>
        )}
      </div>
    </div>
  );
}

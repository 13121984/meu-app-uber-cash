
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Confetti } from "./confetti";

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  const { toast } = useToast();
  // Usando useRef para rastrear o estado do toast sem causar re-renderizações
  const hasShownToast = useRef(false);

  // isComplete é determinado diretamente das props, garantindo consistência servidor/cliente.
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  useEffect(() => {
    // Este efeito lida com a notificação do lado do cliente.
    // O uso de `useRef` evita que a atualização do estado cause um erro de hidratação.
    if (isComplete && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: "Meta Atingida!",
        description: "Você conseguiu! Continue acelerando para o próximo objetivo!",
      });
    } else if (!isComplete && hasShownToast.current) {
      // Redefine se a meta não for mais cumprida (por exemplo, se o filtro de período mudar)
      hasShownToast.current = false;
    }
  }, [isComplete, toast]);
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const remaining = target - current;

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 overflow-hidden">
      {isComplete && <Confetti />}
      
      <div className="w-full px-1">
        <div className="relative h-2 w-full rounded-full bg-gray-700 dark:bg-gray-800">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${clampedProgress}%`}}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `calc(${clampedProgress}% - 16px)` }}
          >
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
              <Car
                className="h-5 w-5 text-primary"
                fill="currentColor"
              />
            </div>
          </div>
           <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
           <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border-2 border-foreground" />
        </div>
         <div className="w-full h-px border-b border-dashed border-gray-600 mt-1" />

      </div>

      <div className="text-center">
        <p className="font-semibold text-lg text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(current)} de {formatCurrency(target)}
        </p>
         {remaining > 0 && !isComplete && (
          <p className="text-xs text-yellow-400 mt-2">Faltam {formatCurrency(remaining)} para sua meta</p>
        )}
      </div>
    </div>
  );
}

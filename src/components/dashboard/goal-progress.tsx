
"use client"

import React from 'react';
import { Flag } from "lucide-react";
import { AppLogo } from '../ui/app-logo';

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const remaining = target - current;

  return (
    <div className="space-y-4 p-4">
        <div className="flex justify-between items-end">
            <div className="text-left">
                <p className="font-semibold text-2xl text-foreground">{clampedProgress.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">
                {formatCurrency(current)} de {formatCurrency(target)}
                </p>
            </div>
            {isComplete ? (
                 <p className="text-sm text-green-500 dark:text-green-400 font-semibold">Parabéns, meta concluída!</p>
            ) : (
                 remaining > 0 && <p className="text-sm text-yellow-500 dark:text-yellow-400 font-semibold">Faltam {formatCurrency(remaining)}</p>
            )}
           
        </div>
      
      {/* A "Estrada" da Meta */}
      <div className="relative w-full flex items-center h-16">
        {/* A Linha da Estrada */}
        <div className="relative w-full h-1.5 bg-secondary rounded-full">
            <div 
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${clampedProgress}%`}}
            />
        </div>
        
        {/* O Carro */}
        <div
            className="absolute top-1/2 transition-all duration-500"
            style={{ 
                left: `calc(${clampedProgress}% - 24px)`, // Ajusta a posição do carro
                transform: 'translateY(-50%)'
            }}
        >
            <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center p-1">
                <AppLogo className="h-10 w-10 text-primary drop-shadow-lg" />
            </div>
        </div>

        {/* Linha de Chegada */}
         <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Flag className="h-6 w-6 text-foreground" />
        </div>
      </div>
    </div>
  );
}

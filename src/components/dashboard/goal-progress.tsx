
"use client"

import React from 'react';
import { Target } from "lucide-react";
import { AppLogo } from '../ui/app-logo'; // Usando o novo logo

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
    <div className="relative flex items-center justify-center space-x-8 p-4 min-h-[200px]">
      
      {/* A "Estrada" da Meta */}
      <div className="relative w-1.5 h-48 bg-secondary rounded-full">
         {/* Linha pontilhada para o caminho a percorrer */}
        <div 
            className="absolute left-1/2 -translate-x-1/2 w-px h-full"
            style={{
                background: `linear-gradient(to bottom, transparent 0%, transparent 50%, hsl(var(--primary)) 50%, hsl(var(--primary)) 100%)`,
                backgroundSize: '1px 10px',
                top: 0
            }}
        ></div>

        {/* Progresso preenchido */}
        <div 
          className="absolute bottom-0 left-0 w-full rounded-full bg-primary transition-all duration-500"
          style={{ height: `${clampedProgress}%`}}
        />
        
        {/* Ponto de partida */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />

        {/* Ponto de chegada */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-card rounded-full border-2 border-foreground flex items-center justify-center">
            <Target className="h-2.5 w-2.5 text-foreground" />
        </div>

        {/* O Carro */}
        <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ bottom: `calc(${clampedProgress}% - 16px)` }}
        >
            <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm">
                <AppLogo className="h-6 w-6 text-primary" />
            </div>
        </div>
      </div>

      {/* Informações da Meta */}
      <div className="text-left flex-1">
        <p className="font-semibold text-xl text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(current)} de {formatCurrency(target)}
        </p>
         {remaining > 0 && !isComplete && (
          <p className="text-sm text-yellow-500 dark:text-yellow-400 mt-2 font-semibold">Faltam {formatCurrency(remaining)} para sua meta</p>
        )}
        {isComplete && (
            <p className="text-sm text-green-500 dark:text-green-400 font-semibold mt-2">Parabéns, meta concluída!</p>
        )}
      </div>
    </div>
  );
}

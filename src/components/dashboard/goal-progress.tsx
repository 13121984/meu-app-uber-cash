
"use client"

import React from 'react';
import { Flag, Car } from "lucide-react";
import { motion } from 'framer-motion';

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

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
        <div className="relative w-full h-8 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-yellow-400 -translate-y-1.5 opacity-50"></div>
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-yellow-400 translate-y-1 opacity-50"></div>

             <motion.div 
                className="absolute left-0 top-0 h-full rounded-lg bg-primary/30"
                initial={{ width: '0%' }}
                animate={{ width: `${clampedProgress}%`}}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
        </div>
        
        {/* O Carro */}
        <motion.div
            className="absolute top-1/2"
            initial={{ left: '0%' }}
            animate={{ left: `calc(${clampedProgress}% - 20px)` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ 
                transform: 'translateY(-50%)'
            }}
        >
            <motion.div
              className="animate-float"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
            </motion.div>
        </motion.div>

        {/* Linha de Chegada */}
         <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Flag className="h-6 w-6 text-white" />
             {isComplete && (
                <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-green-500/50 animate-ping opacity-75" />
            )}
        </div>
      </div>
    </div>
  );
}

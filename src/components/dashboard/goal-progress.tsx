
"use client"

import React, { useState, useEffect } from 'react';
import { Car, Flag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Confetti } from "./confetti";
import { Card } from '../ui/card';

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  useEffect(() => {
    // Ativa o pop-up apenas uma vez quando a meta é atingida
    if (isComplete && !goalCompleted) {
      setShowConfetti(true);
      setGoalCompleted(true); // Marca que a meta foi completada para não mostrar de novo
    }
  }, [isComplete, goalCompleted]);

  const handleClose = () => {
    setShowConfetti(false);
  };


  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-4">
      {/* Road container */}
      <div className="w-full px-4">
        <div className="relative h-16 w-full rounded-lg bg-gray-700 dark:bg-gray-800 p-2 overflow-hidden shadow-inner">
          {/* Dashed line */}
          <div className="absolute top-1/2 left-0 w-full h-1 border-t-4 border-dashed border-yellow-400 -translate-y-1/2"></div>
          
          {/* Car with shadow */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
            style={{ left: `calc(${clampedProgress}% - 20px)` }}
          >
            <Car
              className="relative h-10 w-10 text-primary drop-shadow-lg"
              style={{ transform: 'translateY(-4px)' }}
            />
          </div>
          
          {/* Finish Line */}
          <Flag className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-8 text-green-500 drop-shadow-md" />
        </div>
      </div>

      {/* Progress Info */}
      <Card className="bg-secondary/50 w-full">
        <div className="p-4 text-center">
            <p className="font-semibold text-2xl text-primary">{clampedProgress.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
            {current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </div>
      </Card>

      <AlertDialog open={showConfetti} onOpenChange={setShowConfetti}>
        {showConfetti && <Confetti />}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-headline text-center text-primary">Meta Atingida!</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2">
              Você conseguiu! Continue acelerando para o próximo objetivo!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

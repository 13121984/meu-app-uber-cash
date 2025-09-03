
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

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  useEffect(() => {
    if (isComplete && !goalCompleted) {
      setShowPopup(true);
      setGoalCompleted(true);
    }
    if (!isComplete && goalCompleted) {
      setGoalCompleted(false);
    }
  }, [isComplete, goalCompleted]);

  const handleClose = () => {
    setShowPopup(false);
  };
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const remaining = target - current;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Progress Bar */}
      <div className="w-full px-1">
        <div className="relative h-2 w-full rounded-full bg-gray-700 dark:bg-gray-800">
          {/* Progress fill */}
          <div 
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${clampedProgress}%`}}
          />
          {/* Car Icon */}
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
           {/* Start and End markers */}
           <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
           <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border-2 border-foreground" />
        </div>
         <div className="w-full h-px border-b border-dashed border-gray-600 mt-1" />

      </div>

      {/* Progress Info */}
      <div className="text-center">
        <p className="font-semibold text-lg text-foreground">{clampedProgress.toFixed(0)}% da meta</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(current)} de {formatCurrency(target)}
        </p>
         {remaining > 0 && (
          <p className="text-xs text-yellow-400 mt-2">Faltam {formatCurrency(remaining)} para sua meta</p>
        )}
      </div>

      <AlertDialog open={showPopup} onOpenChange={setShowPopup}>
        {showPopup && <Confetti />}
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-headline text-center text-primary">Meta Atingida!</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2 text-muted-foreground">
              Você conseguiu! Continue acelerando para o próximo objetivo!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose} className="bg-primary hover:bg-primary/90">Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

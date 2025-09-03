"use client"

import React from 'react';
import { Car, Flag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 pt-4">
      <div className="w-full">
        <div className="relative h-10 w-full">
          {/* Road */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted rounded-full -translate-y-1/2" />
          
          {/* Car */}
          <Car
            className="absolute top-1/2 -translate-y-1/2 h-6 w-6 text-primary transition-all duration-1000 ease-out"
            style={{ left: `calc(${clampedProgress}% - 12px)` }}
          />
          
          {/* Finish Line */}
          <Flag className="absolute top-1/2 right-0 -translate-y-1/2 h-6 w-6 text-green-500" />
        </div>
        <Progress value={clampedProgress} className="h-2 mt-2" />
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <p className="font-semibold text-lg">{clampedProgress.toFixed(1)}%</p>
      </div>

      <AlertDialog open={isComplete}>
        {isComplete && <Confetti />}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline text-center text-accent">Meta Atingida!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Você conseguiu! Continue acelerando para o próximo objetivo!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

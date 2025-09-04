
"use client"

import React, { useState, useEffect } from 'react';
import { Car, Flag, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { Confetti } from "./confetti";

type GoalProgressProps = {
  progress: number;
  target: number;
  current: number;
};

// Simple cash register sound in Base64 format
const cashRegisterSound = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABoR2tGYWFFAAAAAPcAAAN3AAAAAAAAAFl+ZWW3s1sLdGAAAAAAAAAIjbQBAAAAAAEAAAIiUKgZn3oAAAGPBAEABAAgAAEABpVoaWdodG9uZQAAAAAAbHVrYXNhbG1lbnRpbmVsbG9nYW5kZXZAAAAAAP/7QMQAAAAAAAAAAAAAAAAAAAAAAARsYXZjNTguOTEuMTAwBICAgAgAgIAHAAACAET/wkAAASIgaJkAMgAABwAAAnQCkQhEAEQwBIDS8AAAAAAD/8A/wD4AAAAA//pAQHwAAAAEwADAnQAAAD/8A/wDwAAAAAABYhEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAGYlEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAGolEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAHYlEcH3AATCQDP8AAAAnAAAHgQjGgANAQAAAwBvGgA//pAQHMAADASYAAAAnAAAD/8A/wDwAAAAAAIAAAAAAAAggAB/AAD//dAwAAMAAAN4AAANIAAD/9gYBAkAAjSRgYhL//dAwLAAKAAAN4AAANIAAD/9gYBAkAEDSRgYhL//dAwqQAnAAAN4AAANIAAD/9gYBAkAEzSRgYhL//dAwjQCPAAAN4AAANIAAD/9gYBAkAFDS.";

export function GoalProgress({ progress, target, current }: GoalProgressProps) {
  const { toast } = useToast();
  const [goalReached, setGoalReached] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // This logic now runs only on the client, after hydration.
    setAudio(new Audio(cashRegisterSound));
  }, []);


  const isComplete = progress >= 100;
  const clampedProgress = Math.min(progress, 100);

  useEffect(() => {
    // This logic now runs only on the client, after hydration.
    if (isComplete && !goalReached) {
      setGoalReached(true);
      if (audio) {
        audio.play();
      }
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500"/><span>Meta Atingida!</span></div>,
        description: "Você conseguiu! Continue acelerando para o próximo objetivo!",
      });
    } else if (!isComplete && goalReached) {
      // Reset if the goal is no longer met (e.g., data changes)
      setGoalReached(false);
    }
  }, [isComplete, goalReached, toast, audio]);
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const remaining = target - current;

  return (
    <div className="relative flex flex-col items-center justify-center space-y-4 overflow-hidden">
      {isComplete && <Confetti />}
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
    </div>
  );
}

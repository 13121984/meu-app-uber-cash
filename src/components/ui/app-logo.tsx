
"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const AppLogo = ({ className }: { className?: string }) => {
  return (
    // TODO: Cole o código do seu arquivo SVG aqui dentro.
    // Mantenha a primeira linha <svg ...> e adicione o `className={cn("lucide-car", className)}`
    // para que ele herde o estilo correto.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide-car", className)}
    >
      {/* Exemplo: <path d="..."/> <circle cx="..."/> etc. */}
      <path d="M14 16.94V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.06" />
      <path d="M19 14h-3.5a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .5-.5H19" />
      <path d="M5 14h3.5a.5.5 S.5-.5V10a.5.5 0 0 0-.5-.5H5" />
      <path d="M12 17.01V10" />
      <path d="M5 10V8c0-1.66 3.13-3 7-3s7 1.34 7 3v2" />
    </svg>
  );
};

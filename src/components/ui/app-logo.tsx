
"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const AppLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide-car", className)}
    >
        <path d="M19.33 11.6602C20.33 11.6602 21.16 10.8302 21.16 9.83017V8.50017C21.16 7.40017 20.26 6.50017 19.16 6.50017C18.66 6.50017 18.2 6.71017 17.86 7.05017C17.11 5.43017 15.42 4.34017 13.5 4.34017H10.5C8.58 4.34017 6.89 5.43017 6.14 7.05017C5.8 6.71017 5.34 6.50017 4.84 6.50017C3.74 6.50017 2.84 7.40017 2.84 8.50017V9.83017C2.84 10.8302 3.67 11.6602 4.67 11.6602H5.5V13.8302C5.5 14.9302 6.4 15.8302 7.5 15.8302H8V17.5002C8 18.0002 8.35 18.5602 8.87 18.8202L9.5 19.1602H14.5L15.13 18.8202C15.65 18.5602 16 18.0002 16 17.5002V15.8302H16.5C17.6 15.8302 18.5 14.9302 18.5 13.8302V11.6602H19.33Z" strokeMiterlimit="10"/>
        <path d="M8 15.8301H16" strokeMiterlimit="10"/>
        <path d="M5.5 11.6599H18.5" strokeMiterlimit="10"/>
    </svg>
  );
};

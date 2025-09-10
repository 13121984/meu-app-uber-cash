
"use client";

import React from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className={cn(
                  "w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float-auth"
              )}>
                <Car className="h-16 w-16 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-60"></div>
            </div>
            <h1 className="text-4xl font-bold font-headline mt-6">Uber Cash</h1>
            <p className="text-muted-foreground">Sua rota para o sucesso.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

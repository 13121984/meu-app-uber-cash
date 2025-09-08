
import React from 'react';
import { AppLogo } from '@/components/ui/app-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-2xl bg-primary flex items-center justify-center border-4 border-primary-foreground/50 shadow-lg">
                <AppLogo className="h-16 w-16 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold font-headline mt-4">Rota Certa</h1>
            <p className="text-muted-foreground">Sua rota certa para o sucesso.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

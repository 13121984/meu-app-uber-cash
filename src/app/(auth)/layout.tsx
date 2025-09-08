
import React from 'react';
import { Car } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Car className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline mt-4">Rota Certa</h1>
            <p className="text-muted-foreground">Sua rota certa para o sucesso.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

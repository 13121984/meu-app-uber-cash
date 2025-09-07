
import { Car } from 'lucide-react';
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <Car className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold font-headline mt-4">Rota Certa</h1>
            <p className="text-muted-foreground">Sua jornada para o sucesso começa aqui.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

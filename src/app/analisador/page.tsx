
import { BotMessageSquare } from 'lucide-react';
import { AnalyzerClient } from '@/components/analisador/analyzer-client';

export default async function AnalisadorPage() {
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <BotMessageSquare className="w-8 h-8 text-primary" />
            Analisador de Corridas com IA
        </h1>
        <p className="text-muted-foreground">Tire um print de uma oferta de corrida e deixe a IA dizer se vale a pena.</p>
      </div>
      
      <AnalyzerClient />
    </div>
  );
}

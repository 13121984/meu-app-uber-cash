// src/app/minha-pagina/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyzerClient } from '@/components/analisador/analyzer-client';

// Esta página serve como um ambiente de teste isolado para o componente AnalisadorDeCorrida.
// No futuro, este componente será integrado a um fluxo de "Rascunho do Dia".
export default function InternalTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Teste Interno</h1>
      <AnalyzerClient />
    </div>
  );
}

// src/app/minha-pagina/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Esta página serve como um ambiente de teste isolado.
// No futuro, componentes para o balão flutuante podem ser testados aqui.
export default function InternalTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Teste Interno</h1>
      <Card>
        <CardHeader>
            <CardTitle>Ambiente de Testes</CardTitle>
        </CardHeader>
        <CardContent>
            <p>Esta página está pronta para futuros testes de componentes, como os que serão usados no balão flutuante.</p>
        </CardContent>
      </Card>
    </div>
  );
}

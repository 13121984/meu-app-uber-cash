
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalisadorDeCorrida } from '@/components/analisador/analisador-de-corrida';

export default function MinhaPagina() {
  return (
    <div className="container mx-auto p-4">
      <AnalisadorDeCorrida />
    </div>
  );
}


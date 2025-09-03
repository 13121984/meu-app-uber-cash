import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MetasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Gerenciar Metas</h1>
        <p className="text-muted-foreground">Defina e acompanhe suas metas financeiras.</p>
      </div>
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Target className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Página em Construção</h2>
          <p className="text-muted-foreground">Em breve você poderá adicionar, editar e visualizar suas metas aqui.</p>
      </Card>
    </div>
  );
}

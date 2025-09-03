import { History } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function GerenciamentoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Histórico de Registros</h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <History className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Página em Construção</h2>
          <p className="text-muted-foreground">Em breve você poderá visualizar, editar e apagar seus registros passados aqui.</p>
      </Card>
    </div>
  );
}

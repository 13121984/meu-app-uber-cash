import { BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Relatórios</h1>
        <p className="text-muted-foreground">Analise sua performance com filtros avançados.</p>
      </div>
       <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-card border-border">
          <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Página em Construção</h2>
          <p className="text-muted-foreground">Em breve você poderá gerar relatórios detalhados com gráficos e filtros por período.</p>
      </Card>
    </div>
  );
}

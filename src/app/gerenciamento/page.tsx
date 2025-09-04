
import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { columns } from '@/components/gerenciamento/columns';
import { DataTable } from '@/components/gerenciamento/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function GerenciamentoPage() {
  const workDays = await getWorkDays();

  // Adicionamos cálculos de lucro diretamente aqui para passar para a coluna
  const dataForTable = workDays.map(day => {
    const totalGanhos = day.earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalCombustivel = day.fuelEntries.reduce((sum, f) => sum + f.paid, 0);
    const totalManutencao = day.maintenance.amount || 0;
    const lucro = totalGanhos - totalCombustivel - totalManutencao;

    return {
      ...day,
      lucro,
      totalGanhos,
      totalGastos: totalCombustivel + totalManutencao,
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Histórico de Ganhos
        </h1>
        <p className="text-muted-foreground">Visualize e edite seus dias de trabalho passados.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Seus Registros</CardTitle>
            <CardDescription>
                Aqui está a lista de todos os seus dias de trabalho registrados.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={dataForTable} />
        </CardContent>
      </Card>
    </div>
  );
}



import { History } from 'lucide-react';
import { getWorkDays } from '@/services/work-day.service';
import { ColumnsComponent } from '@/components/gerenciamento/columns';
import { DataTable } from '@/components/gerenciamento/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function GerenciamentoPage() {
  const workDays = await getWorkDays();

  // Os cálculos agora são feitos diretamente nas células da coluna
  // para garantir que estejam sempre sincronizados.
  const dataForTable = workDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


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
            {/* O DataTable agora renderiza as colunas e os diálogos de edição/alerta */}
            <DataTableClient data={dataForTable} />
        </CardContent>
      </Card>
    </div>
  );
}


// Componente cliente para encapsular a lógica da tabela e seus diálogos
function DataTableClient({ data }: { data: any[] }) {
  const { columns, dialog, alertDialog } = ColumnsComponent();
  return (
    <>
      <DataTable columns={columns} data={data} />
      {dialog}
      {alertDialog}
    </>
  );
}

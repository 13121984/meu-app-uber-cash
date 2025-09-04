
"use client";

import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";

export function GerenciamentoClient({ data }: { data: any[] }) {
  const { columns, Dialogs } = useWorkDayColumns();

  return (
    <>
      <DataTable columns={columns} data={data} />
      {Dialogs}
    </>
  );
}

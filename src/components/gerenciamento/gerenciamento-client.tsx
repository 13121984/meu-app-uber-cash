
"use client";

import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import type { WorkDay } from "@/services/work-day.service";

export function GerenciamentoClient({ data }: { data: WorkDay[] }) {
  const { columns, Dialogs } = useWorkDayColumns();

  return (
    <>
      <DataTable columns={columns} data={data} />
      {Dialogs}
    </>
  );
}

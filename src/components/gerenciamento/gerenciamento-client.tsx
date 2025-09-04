
"use client";

import { useWorkDayColumns } from "./columns";
import { DataTable } from "./data-table";
import type { WorkDay } from "@/services/work-day.service";
import { HistoryFilters } from "./history-filters";

export function GerenciamentoClient({ data }: { data: WorkDay[] }) {
  const { columns, Dialogs } = useWorkDayColumns();

  return (
    <div className="space-y-4">
      <HistoryFilters />
      <DataTable columns={columns} data={data} />
      {Dialogs}
    </div>
  );
}

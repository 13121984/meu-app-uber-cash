"use client";

import { WorkDay } from "@/services/work-day.service";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface HistoryClientProps {
  data: WorkDay[];
}

export function HistoryClient({ data }: HistoryClientProps) {
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}

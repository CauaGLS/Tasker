"use client";

import { TaskSchema } from "@/services";
import { useQueryState } from "nuqs";

import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

export function List({ tasks, isLoading }: { tasks: TaskSchema[]; isLoading: boolean }) {
  const [_, setTask] = useQueryState("t");

  return (
    <DataTable
      columns={columns}
      data={tasks}
      noResultsMessage="Nenhuma tarefa encontrada"
      isLoading={isLoading}
      onRowClick={(row) => {
        setTask(row.id.toString());
      }}
    />
  );
}

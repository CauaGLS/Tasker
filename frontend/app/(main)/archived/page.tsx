"use client";

import { TasksService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { ColumnFiltersState } from "@tanstack/react-table";
import { useQueryState } from "nuqs";
import { useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { STATUS } from "@/lib/labels";

import { columns } from "./columns";

export default function ArchivedPage() {
  const [search, setSearch] = useQueryState("search");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks-archive"],
    queryFn: TasksService.getArchivedTasks,
  });

  return (
    <>
      <h1 className="flex items-center gap-1 text-2xl font-bold">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <span className="mr-auto">Arquivados</span>
      </h1>
      <DataTable
        columns={columns}
        data={tasks?.filter((task) => task.title.toLowerCase().includes(search?.toLowerCase() ?? ""))}
        noResultsMessage="Nenhuma tarefa encontrada"
        isLoading={isLoading}
        searchColumn="title"
        search={search ?? undefined}
        onSearchChange={setSearch}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        filters={[
          {
            title: "Status",
            column: "status",
            options: STATUS,
          },
        ]}
      />
    </>
  );
}

import { TaskSchema } from "@/services";
import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table";
import { StatusDot } from "@/components/ui/status-dot";

import { formatDatetime } from "@/lib/utils";

export const columns: ColumnDef<TaskSchema>[] = [
  {
    accessorKey: "title",
    header: "Título",
    size: 1000,
    cell: ({ row }) => <div className="max-w-[200px] truncate lg:max-w-[400px]">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusDot variant={row.getValue("status")} />
      </div>
    ),
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Atualizado" />
    ),
    cell: ({ row }) => <div className="text-center">{formatDatetime(row.getValue("updated_at"))}</div>,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Criado" />
    ),
    cell: ({ row }) => <div className="text-center">{formatDatetime(row.getValue("created_at"))}</div>,
  },
];

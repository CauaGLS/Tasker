import { TaskSchema, TasksService } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusDot } from "@/components/ui/status-dot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { formatDatetime } from "@/lib/utils";

export const columns: ColumnDef<TaskSchema>[] = [
  {
    id: "actions",
    size: 40,
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-center" column={column} title="Ações" />
    ),
    cell: ({ row }) => <ActionCell row={row.original} />,
  },
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

function ActionCell({ row }: { row: TaskSchema }) {
  const queryClient = useQueryClient();

  const restore = useMutation({
    mutationFn: TasksService.restoreTask,
    onSuccess: () => {
      toast.success("Tarefa restaurada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["tasks-archive"] });
    },
  });

  const remove = useMutation({
    mutationFn: TasksService.forceDeleteTask,
    onSuccess: () => {
      toast.success("Tarefa apagada com sucesso");
      queryClient.setQueryData(["tasks-archive"], (tasks: TaskSchema[]) =>
        tasks.filter((task) => task.id !== row.id),
      );
    },
  });
  

  return (
    <div className="flex justify-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="size-7 text-xs"
            size="icon"
            onClick={() => restore.mutate({ taskId: row.id })}
            disabled={restore.isPending}
          >
            {!restore.isPending && <ArchiveRestore className="!size-3.5" />}
            {restore.isPending && <Loader2 className="!size-3.5 animate-spin" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Restaurar</TooltipContent>
      </Tooltip>

      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" className="size-7 text-xs" size="icon" disabled={remove.isPending}>
                {!remove.isPending && <Trash2 className="!size-3.5" />}
                {remove.isPending && <Loader2 className="!size-3.5 animate-spin" />}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Apagar</TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza que deseja apagar essa tarefa?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar a tarefa permanentemente e remover seus dados
              do nosso servidor.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="destructive" onClick={() => remove.mutate({ taskId: row.id })}>
              Apagar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

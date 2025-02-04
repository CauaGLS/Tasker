import { TaskSchema } from "@/services";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { STATUS } from "@/lib/labels";
import { cn } from "@/lib/utils";

import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { StatusDot } from "../ui/status-dot";
import { TaskCard } from "./task-card";

export type Column = (typeof STATUS)[number];

export type ColumnType = "Column";

export type ColumnDragData = {
  type: ColumnType;
  column: Column;
};

interface BoardColumnProps {
  column: Column;
  tasks: TaskSchema[];
  isOverlay?: boolean;
  isLoading?: boolean;
}

const variants = cva("flex flex-shrink-0 snap-center flex-col overflow-hidden bg-primary-foreground", {
  variants: {
    dragging: {
      default: "border-2 border-transparent",
      over: "opacity-30 ring-2",
      overlay: "ring-2 ring-primary",
    },
  },
});

export const BoardColumn = ({ column, tasks, isOverlay, isLoading }: BoardColumnProps) => {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.value,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.value}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        variants({
          dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
        }),
      )}
    >
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b-2 px-4 py-2 font-semibold">
        <StatusDot variant={column.value} />
        <Badge variant="secondary" className="ml-auto font-mono">
          {tasks.length}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-2 overflow-y-auto p-2 md:min-h-0">
        <SortableContext items={tasksIds}>
          {tasks.length === 0 && !isLoading ? (
            <div className="flex flex-grow items-center justify-center">
              <p className="mt-6 text-muted-foreground">Nenhuma tarefa aqui</p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
        {isLoading &&
          Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} className="h-[60px]" />)}
      </CardContent>
    </Card>
  );
};

"use client";

import { TaskSchema } from "@/services";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { useQueryState } from "nuqs";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "../ui/badge";

type TaskCardProps = {
  task: TaskSchema;
  isOverlay?: boolean;
};

export type TaskType = "Task";

export type TaskDragData = {
  type: TaskType;
  task: TaskSchema;
};

const variants = cva("cursor-pointer transition-colors hover:bg-accent", {
  variants: {
    dragging: {
      over: "opacity-30 ring-2",
      overlay: "ring-2 ring-primary",
    },
  },
});

export const TaskCard = memo(({ task, isOverlay }: TaskCardProps) => {
  const [_, setTaskId] = useQueryState("t");

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
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
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
      onClick={() => setTaskId(task.id.toString())}
    >
      <CardContent className="flex flex-col gap-1.5 overflow-hidden p-4">
        <div className="flex items-center text-left align-middle">
          <Button
            variant="ghost"
            className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50"
            {...attributes}
            {...listeners}
          >
            <span className="sr-only">Move task</span>
            <GripVertical />
          </Button>
          <span className="text-sm font-medium">{task.title}</span>
          <Avatar className="ml-auto size-7 rounded-md">
            <AvatarImage src={task.created_by.image ?? ""} />
            <AvatarFallback className="rounded-md text-xs">
              {task.created_by.name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        {!!task.tags?.length && (
          <div className="flex w-full flex-wrap gap-2">
            {task.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = "TaskCard";

"use client";

import { useMounted } from "@/hooks/use-mounted";
import { TaskSchema, TaskStatus } from "@/services";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";

import { STATUS } from "@/lib/labels";

import type { Column } from "./column";
import { BoardColumn } from "./column";
import { coordinateGetter } from "./coordinate";
import { TaskCard } from "./task-card";
import { hasDraggableData } from "./utils";

export function Kanban({
  tasks,
  onValueChange,
  isLoading,
}: {
  tasks: TaskSchema[];
  onValueChange?: (taskId: number, status: TaskStatus, order: number) => void;
  isLoading?: boolean;
}) {
  const queryClient = useQueryClient();
  const isMounted = useMounted();

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<TaskSchema | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;

    if (data?.type === "Column") {
      setActiveColumn(data.column);
      return;
    }

    if (data?.type === "Task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    const activeData = active.data.current;

    if (activeData?.type === "Task") {
      const t = tasks.filter((t) => t.status === activeData.task.status);

      const taskIndex = t.findIndex((t) => t.id === activeData.task.id);
      const prevOrder = t?.[taskIndex - 1]?.order;
      const nextOrder = t?.[taskIndex + 1]?.order;

      let newOrder = activeData.task.order;
      if (prevOrder) {
        newOrder = prevOrder;
      }
      if (!prevOrder && nextOrder) {
        newOrder = nextOrder - 1;
      }
      onValueChange?.(activeData.task.id, activeData.task.status, newOrder);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === "Task";
    const isOverATask = overData?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      queryClient.setQueryData(["tasks"], (currentTasks: TaskSchema[]) => {
        const tasks = JSON.parse(JSON.stringify(currentTasks)) as TaskSchema[];

        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];
        if (activeTask && overTask && activeTask.status !== overTask.status) {
          activeTask.status = overTask.status;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = overData?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      queryClient.setQueryData(["tasks"], (currentTasks: TaskSchema[]) => {
        const tasks = JSON.parse(JSON.stringify(currentTasks)) as TaskSchema[];

        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.status = overId as TaskStatus;
          return arrayMove(tasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  }

  if (!isMounted || isLoading)
    return (
      <div className="grid flex-grow gap-2 overflow-hidden md:grid-cols-3 md:gap-4">
        {STATUS.map((col) => (
          <BoardColumn key={col.value} column={col} tasks={[]} isLoading={isLoading} />
        ))}
      </div>
    );

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
      <div className="grid flex-grow gap-2 overflow-hidden md:grid-cols-3 md:gap-4">
        {STATUS.map((col) => (
          <BoardColumn
            key={col.value}
            column={col}
            tasks={tasks.filter((task) => task.status === col.value)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <BoardColumn
              isOverlay
              column={activeColumn}
              tasks={tasks.filter((task) => task.status === activeColumn.value)}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
}

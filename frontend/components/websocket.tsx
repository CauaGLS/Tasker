"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { TaskSchema } from "@/services/types.gen";
import { useQueryClient } from "@tanstack/react-query";
import { DetailTaskSchema } from "@/services/types.gen";

export function Websocket() {
  const queryClient = useQueryClient();

  useWebSocket({
    onMessage: (data) => {
      const { event, task } = JSON.parse(data.data);

      if (event === "task:created") {
        handleTaskCreated(task);
      } else if (event === "task:updated") {
        handleTaskUpdated(task);
      }
    },
  });

  async function handleTaskCreated(task: TaskSchema) {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.setQueryData(["tasks", task.id], task);
  }

  async function handleTaskUpdated(task: DetailTaskSchema) {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  
    queryClient.setQueryData(["tasks", task.id], (oldData: DetailTaskSchema | undefined) => {
      return oldData ? { ...oldData, ...task } : task;
    });
  
    if (task.deleted_at) {
      await queryClient.invalidateQueries({ queryKey: ["tasks-archive"] });
    }
  }

  return null;
}
"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { TaskSchema } from "@/services/types.gen";
import { useQueryClient } from "@tanstack/react-query";
import { DetailTaskSchema } from "@/services/types.gen";
import { toast } from "sonner";

export function Websocket() {
  const queryClient = useQueryClient();

  useWebSocket({
    onMessage: (data) => {
      const parsedData = JSON.parse(data.data);
      const { event, task, message } = parsedData; // 🔹 Agora pegamos `message` do backend

      if (event === "task:created") {
        handleTaskCreated(task, message);
      } else if (event === "task:updated") {
        handleTaskUpdated(task, message);
      } else if (event === "task:archived") {
        handleTaskArchived(task, message);
      }
    },
  });

  async function handleTaskCreated(task: TaskSchema, message: string) {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.setQueryData(["tasks", task.id], task);

    toast.success(`Tarefa Criada ✅`, {
      description: message, // 🔹 Agora a mensagem vem do backend
    });
  }

  async function handleTaskUpdated(task: DetailTaskSchema, message: string) {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });

    queryClient.setQueryData(["tasks", task.id], (oldData: DetailTaskSchema | undefined) => {
      return oldData ? { ...oldData, ...task } : task;
    });

    toast.info(`Tarefa Atualizada ✏️`, {
      description: message, // 🔹 Agora a mensagem vem do backend
    });
  }

  async function handleTaskArchived(task: DetailTaskSchema, message: string) {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });

    queryClient.setQueryData(["tasks", task.id], (oldData: DetailTaskSchema | undefined) => {
      return oldData ? { ...oldData, ...task } : task;
    });
  }

  return null;
}

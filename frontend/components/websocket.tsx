"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { TaskSchema } from "@/services/types.gen";
import { useQueryClient } from "@tanstack/react-query";
import { DetailTaskSchema } from "@/services/types.gen";
import { toast } from "sonner";
import { useState } from "react";

export function Websocket() {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  useWebSocket({
    onMessage: (data) => {
      const { event, task, notifications } = JSON.parse(data.data);

      if (event === "task:created") {
        handleTaskCreated(task);
      } else if (event === "task:updated") {
        handleTaskUpdated(task);
      } else if (event === "notification_list") {
        setUnreadCount(notifications.length);
        showUnreadToast(notifications.length);
      } else if (event === "notification") {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          showUnreadToast(newCount);
          return newCount;
        });
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

  function showUnreadToast(count: number) {
    if (count > 0) {
      toast.info(`🔔 Você possui ${count} novas notificações!`, {
        duration: 5000,
      });
    }
  }

  return null;
}
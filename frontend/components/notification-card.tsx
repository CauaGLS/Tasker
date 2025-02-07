import { BellRing, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { TasksService } from "@/services";
import { toast } from "sonner";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";

// 🔹 Definição do schema Zod para notificações
const NotificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  created_at: z.string(),
  title: z.string().default("Tarefa Atualizada"),
  user: z.object({ name: z.string() }).transform((val) => val.name),
});

export function NotificationCard({ setUnreadCount }: { setUnreadCount: (count: number) => void }) {
  const NotificationArraySchema = z.array(NotificationSchema);
  type NotificationType = z.infer<typeof NotificationSchema>;

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [readNotifications, setReadNotifications] = useState<number[]>([]); // 🔹 IDs de notificações lidas

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await TasksService.getNotifications();
        const validatedData = NotificationArraySchema.parse(data);
        setNotifications(validatedData);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    };

    fetchNotifications();
  }, []);

  useWebSocket({
    onMessage: (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        if (parsedData.event === "notification_list") {
          const validatedData = NotificationArraySchema.safeParse(parsedData.data);
          if (validatedData.success) {
            setNotifications(validatedData.data); // 🔹 Apenas adiciona novas notificações
          } else {
            console.error("Erro na validação das notificações recebidas:", validatedData.error);
          }
        } else if (parsedData.event === "notification") {
          const validatedNotification = NotificationSchema.safeParse(parsedData.data);
          if (validatedNotification.success) {
            const notification = validatedNotification.data;

            if (!notifications.some((n) => n.id === notification.id)) {
              toast.info(`🔔 ${notification.user} atualizou "${notification.title}"`, {
                description: notification.message,
                duration: 5000,
              });

              setNotifications((prev) => [notification, ...prev]);
            }
          } else {
            console.error("Erro na validação da notificação recebida:", validatedNotification.error);
          }
        }
      } catch (error) {
        console.error("Erro ao processar notificação WebSocket:", error);
      }
    },
  });

  // 🔹 Marcar todas como lidas e atualizar `unreadCount`
  const markAllAsRead = async () => {
    try {
      await TasksService.markAllRead();
      setReadNotifications(notifications.map((n) => n.id)); // 🔹 Apenas altera a UI
      setUnreadCount(0); // 🔹 Atualiza a contagem no NavUser.tsx
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await TasksService.markAllRead();
      setNotifications([]);
      setUnreadCount(0); 
      toast.success("Notificações limpas com sucesso.");
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* 🔹 Lista de Notificações com ScrollArea */}
        <ScrollArea className="h-[250px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={String(notification.id)}
                className={cn(
                  "flex items-start gap-2 p-2 border-b last:border-b-0",
                  readNotifications.includes(notification.id) ? "opacity-50" : "opacity-100"
                )}
              >
                {!readNotifications.includes(notification.id) && (
                  <span className="h-2 w-2 rounded-full bg-orange-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notification.user} - {new Date(notification.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-muted-foreground">Sem notificações</p>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={markAllAsRead} disabled={notifications.length === 0}>
          <Check /> Marcar todas como lidas
        </Button>
        {/* 🔹 Botão para esconder todas as notificações */}
        <button
          className="text-sm text-purple-700 hover:underline"
          onClick={clearAllNotifications}
          disabled={notifications.length === 0}
        >
          Limpar Notificações
        </button>
      </CardFooter>
    </Card>
  );
}

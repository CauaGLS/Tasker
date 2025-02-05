import { BellRing, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { TasksService } from "@/services";
import { title } from "process";
import { Description } from "@radix-ui/react-dialog";
import { z } from "zod"
import { id } from "date-fns/locale";

const NotificationSchema = z.object({
  id: z.number(),
  message: z.string(),
  created_at: z.string(),
  title: z.string().default("Nova Notificação"),
  description: z.string().default("Você tem uma nova notificação"),
});




export function NotificationCard() {

  const  NotificationArraySchema = z.array(NotificationSchema)
  type NotificationType = z.infer<typeof NotificationSchema>;
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [pushEnabled, setPushEnabled] = useState(true);

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
            setNotifications(validatedData.data);
          } else {
            console.error("Erro na validação das notificações recebidas:", validatedData.error);
          }
        } else if (parsedData.event === "notification") {
          const validatedNotification = NotificationSchema.safeParse(parsedData.data);
          if (validatedNotification.success) {
            setNotifications((prev) => [validatedNotification.data, ...prev]);
          } else {
            console.error("Erro na validação da notificação recebida:", validatedNotification.error);
          }
        }
      } catch (error) {
        console.error("Erro ao processar notificação WebSocket:", error);
      }
    },
  });
  

  const markAllAsRead = async () => {
    try {
      await TasksService.markAllRead();
      setNotifications([]);
    } catch (error) {
      console.error("Error ao marcar notificações como lidas:", error)
    }
  }

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* 🔹 Switch de Push Notifications */}
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Push Notifications</p>
            <p className="text-sm text-muted-foreground">Ativar notificações em tempo real.</p>
          </div>
          <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
        </div>

        {/* 🔹 Lista de Notificações */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={String(notification.id)} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground">Sem notificações</p>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={markAllAsRead} disabled={notifications.length === 0}>
          <Check /> Marcar todas como lidas
        </Button>
      </CardFooter>
    </Card>
  );
}
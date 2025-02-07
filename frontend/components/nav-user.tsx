"use client";

import { Bell, ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { authClient, signOut } from "@/lib/auth-client";
import { NotificationCard } from "./notification-card";
import { Skeleton } from "./ui/skeleton";
import { useWebSocket } from "@/hooks/use-websocket";
import { TasksService } from "@/services";

export function NavUser() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session, isPending, error } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await TasksService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erro ao obter contagem de notificações não lidas:", error);
      }
    };

    fetchUnreadCount();
  }, []);

  useWebSocket({
    onMessage: (data) => {
      const parsedData = JSON.parse(data.data);
      const { event, notifications } = parsedData;

      if (event === "notification_list") {
        setUnreadCount(notifications.length);
      } else if (event === "notification" || event === "task:created" || event === "task:updated") {
        setUnreadCount((prev) => prev + 1);
      }
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  if (isPending) return <Skeleton className="h-8 w-full" />;
  if (error) {
    router.push("/sign-in");
  }

  if (!session?.user) return;

  const markAllAsRead = async () => {
    try {
      await TasksService.markAllRead();
  
      // 🔹 Busca a contagem atualizada do banco antes de atualizar o estado
      const updatedCount = await TasksService.getUnreadCount();
  
      // 🔹 Atualiza o estado corretamente, garantindo que o valor correto do banco seja usado
      setUnreadCount(updatedCount);
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas:", error);
    }
  };
  
  



  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session.user.image ?? ""} alt={session.user.name} />
                    <AvatarFallback className="rounded-lg uppercase">
                      {session.user.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{session.user.name}</span>
                  <span className="truncate text-xs">{session.user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session.user.image ?? ""} alt={session.user.name} />
                    <AvatarFallback className="rounded-lg">{session.user.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session.user.name}</span>
                    <span className="truncate text-xs">{session.user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
                  {theme == "dark" ? <Sun /> : <Moon />}
                  {theme == "dark" ? "Tema Claro" : "Tema Escuro"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2"
                >
                  <Bell />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-purple-500 text-sm text-white">
                      {unreadCount}
                    </span>
                  )}
                  Notificações
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  signOut({
                    fetchOptions: {
                      onSuccess: () => router.push("/sign-in"),
                    },
                  })
                }
              >
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {showNotifications && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setShowNotifications(false)}
        >
          <div 
            ref={notificationRef} 
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationCard setUnreadCount={setUnreadCount} />
          </div> 
        </div>
      )}
    </>
  );
}

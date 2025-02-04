"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { setDefaultOptions } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";

import { SidebarProvider } from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";
import { Websocket } from "./websocket";

setDefaultOptions({ locale: ptBR });

export function Providers({ children, sidebarState }: { children: React.ReactNode; sidebarState: boolean }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
          mutations: {
            onError: (error: any) => {
              let msg: string = error?.body?.message || error.message;
              if (!msg) return toast.error("Erro");

              if (msg.includes("status code 403")) {
                msg = "Você não tem permissão para fazer esta ação";
              } else if (msg.includes("status code 401")) {
                msg = "Você precisa estar logado para fazer esta ação";
              } else if (msg.includes("status code 500")) {
                msg = "Erro interno";
              }
              toast.error("Erro", { description: msg });
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={sidebarState}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <NuqsAdapter>
              {children}
              <Toaster position="top-center" />
              <Websocket />
            </NuqsAdapter>
          </TooltipProvider>
        </ThemeProvider>
      </SidebarProvider>
      <ReactQueryDevtools initialIsOpen={false} position="right" />
    </QueryClientProvider>
  );
}

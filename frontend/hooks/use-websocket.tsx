import useSocket, { Options } from "react-use-websocket";

import { useSession } from "@/lib/auth-client";

interface WebSocketProps extends Options {
  pathname?: string;
  enabled?: boolean;
}

function useWebSocket({
  pathname = "",
  enabled = true,
  reconnectInterval = 3000,
  share = true,
  shouldReconnect = () => true,
  ...options
}: WebSocketProps) {
  const { data: session } = useSession();

  const hostname = process.env.NEXT_PUBLIC_SERVER_URL?.replace("http", "ws");
  const url = `${hostname}/ws`;

  return useSocket(
    `${url}${pathname}`,
    {
      shouldReconnect,
      reconnectInterval,
      share,
      queryParams: {
        token: session?.session?.token!,
      },
      ...options,
    },
    enabled && !!hostname && !!session?.session?.token,
  );
}

export { useWebSocket };

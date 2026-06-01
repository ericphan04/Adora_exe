import { useCallback, useEffect, useRef, useState } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MessageDto } from "../../types/conversation";

const WS_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8085").replace(/\/$/, "");

export type RealtimeStatus = "connecting" | "connected" | "polling" | "offline";

interface UseChatRealtimeOptions {
  activeConversationId: number | null;
  currentUserId: number | undefined;
  onMessage: (message: MessageDto) => void;
  onInboxRefresh: () => void;
  enabled?: boolean;
}

export function useChatRealtime({
  activeConversationId,
  currentUserId,
  onMessage,
  onInboxRefresh,
  enabled = true,
}: UseChatRealtimeOptions) {
  const clientRef = useRef<Client | null>(null);
  const conversationSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  const onMessageRef = useRef(onMessage);
  const onInboxRef = useRef(onInboxRefresh);

  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  onMessageRef.current = onMessage;
  onInboxRef.current = onInboxRefresh;

  const parseMessage = useCallback(
    (body: string): MessageDto | null => {
      try {
        const raw = JSON.parse(body) as MessageDto;
        return {
          ...raw,
          mine: currentUserId != null && raw.senderId === currentUserId,
        };
      } catch {
        return null;
      }
    },
    [currentUserId],
  );

  const subscribeConversation = useCallback(
    (client: Client, conversationId: number) => {
      conversationSubRef.current?.unsubscribe();
      conversationSubRef.current = client.subscribe(
        `/topic/conversation.${conversationId}`,
        (frame: IMessage) => {
          const msg = parseMessage(frame.body);
          if (msg) onMessageRef.current(msg);
        },
      );
    },
    [parseMessage],
  );

  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("offline");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus("connected");
        client.subscribe("/user/queue/inbox", () => {
          onInboxRef.current();
        });
        if (activeConversationId != null) {
          subscribeConversation(client, activeConversationId);
        }
      },
      onDisconnect: () => {
        setStatus("polling");
      },
      onStompError: () => {
        setStatus("polling");
      },
      onWebSocketClose: () => {
        setStatus("polling");
      },
    });

    clientRef.current = client;
    setStatus("connecting");
    client.activate();

    return () => {
      conversationSubRef.current?.unsubscribe();
      conversationSubRef.current = null;
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, subscribeConversation]);

  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || activeConversationId == null) {
      conversationSubRef.current?.unsubscribe();
      conversationSubRef.current = null;
      return;
    }
    subscribeConversation(client, activeConversationId);
  }, [activeConversationId, subscribeConversation]);

  const sendViaWebSocket = useCallback(
    (conversationId: number, content: string) => {
      const client = clientRef.current;
      if (!client?.connected) return false;
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ conversationId, content }),
      });
      return true;
    },
    [],
  );

  return { status, sendViaWebSocket };
}

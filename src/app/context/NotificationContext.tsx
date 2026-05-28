import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { NotificationDto, NotificationType } from "../../types/notification";
import notificationApi from "../../api/notificationApi";
import { useAuth } from "./AuthContext";

const WS_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8085";

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  wsStatus: "connecting" | "connected" | "disconnected";
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  
  const stompClientRef = useRef<Client | null>(null);

  // Fetch all notifications from DB
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
      
      const unreadRes = await notificationApi.getUnreadCount();
      if (unreadRes.success && unreadRes.data !== undefined) {
        setUnreadCount(unreadRes.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark a single notification as read
  const markAsRead = async (id: number) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("Đã đánh dấu đọc tất cả thông báo");
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // Helper to trigger stylish notifications with Sonner toast
  const triggerToastAlert = (notif: NotificationDto) => {
    const title = notif.title;
    const msg = notif.message;
    
    // Style differently based on the category type
    switch (notif.type) {
      case "PAYMENT_SUCCESS":
      case "BOOKING_PAID":
        toast.success(title, {
          description: msg,
          duration: 6000,
        });
        break;
      case "PAYMENT_FAILED":
      case "BOOKING_REJECTED":
        toast.error(title, {
          description: msg,
          duration: 8000,
        });
        break;
      case "BOOKING_ACCEPTED":
        toast.info(title, {
          description: msg,
          duration: 7000,
        });
        break;
      default:
        toast(title, {
          description: msg,
        });
    }
  };

  // WebSocket connection effect
  useEffect(() => {
    // If no user is logged in, clean up any active stomp client
    if (!user) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setWsStatus("disconnected");
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Load existing notifications
    fetchNotifications();

    const token = localStorage.getItem("token");
    if (!token) return;

    setWsStatus("connecting");

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setWsStatus("connected");
        
        // Subscribe to user-specific notifications
        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          try {
            const rawNotif = JSON.parse(message.body) as NotificationDto;
            
            // 1. Add notification to the top of active state list
            setNotifications((prev) => [rawNotif, ...prev]);
            
            // 2. Increment unread count
            setUnreadCount((prev) => prev + 1);
            
            // 3. Trigger Toast alert
            triggerToastAlert(rawNotif);
          } catch (err) {
            console.error("Failed to parse websocket notification body", err);
          }
        });
      },
      onDisconnect: () => {
        setWsStatus("disconnected");
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        setWsStatus("disconnected");
      },
      onWebSocketClose: () => {
        setWsStatus("disconnected");
      }
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setWsStatus("disconnected");
      }
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        wsStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

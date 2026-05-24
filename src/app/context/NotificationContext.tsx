import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NotificationDto } from '../../types/notification';
import notificationApi from '../../api/notificationApi';
import { useAuth } from './AuthContext';
import { notify } from '../utils/notify';

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const prevUnreadCountRef = useRef<number>(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const [notifRes, unreadRes] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);

      if (notifRes.success && notifRes.data) {
        setNotifications(notifRes.data);
      }

      if (unreadRes.success && typeof unreadRes.data === 'number') {
        const newUnreadCount = unreadRes.data;
        
        // If unread count increased, trigger toast alert for the new notification(s)
        if (newUnreadCount > prevUnreadCountRef.current && notifications.length > 0 && notifRes.data) {
          const newNotifs = notifRes.data.filter(
            n => !n.read && !notifications.some(existing => existing.id === n.id)
          );
          newNotifs.forEach(notif => {
            notify.info(notif.title, notif.message);
          });
        }
        
        setUnreadCount(newUnreadCount);
        prevUnreadCountRef.current = newUnreadCount;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch immediately when user logs in, and start polling
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));

      // Polling every 15 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
    }
  }, [token]);

  const markAsRead = async (id: number) => {
    try {
      const response = await notificationApi.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        prevUnreadCountRef.current = 0;
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

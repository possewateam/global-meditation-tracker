import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  deliveryId?: string;
}

export const NotificationToast = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchUnreadNotifications();

    // Subscribe to broadcast channel for real-time notifications
    const broadcastChannel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const notification = payload.payload as NotificationMessage;
        if (!dismissed.has(notification.id)) {
          setNotifications((prev) => [...prev, notification]);

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/logo.svg',
              badge: '/logo.svg',
            });
          }

          setTimeout(() => {
            handleDismiss(notification.id);
          }, 10000);
        }
      })
      .subscribe();

    // Subscribe to database changes for notification_deliveries
    const dbChannel = supabase
      .channel('notification-deliveries-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_deliveries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[NotificationToast] New delivery detected:', payload);
          // Fetch the complete notification data
          fetchNotificationById(payload.new.notification_id, payload.new.id);
        }
      )
      .subscribe();

    // Poll for new notifications every 30 seconds as fallback
    const pollInterval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);

    return () => {
      broadcastChannel.unsubscribe();
      dbChannel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [user, dismissed]);

  const fetchUnreadNotifications = async () => {
    if (!user) return;

    console.log('[NotificationToast] Fetching unread notifications for user:', user.id);

    const { data, error } = await supabase
      .from('notification_deliveries')
      .select(`
        id,
        notification_id,
        notifications (
          id,
          title,
          body
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'sent')
      .order('delivered_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[NotificationToast] Error fetching notifications:', error);
      return;
    }

    console.log('[NotificationToast] Fetched deliveries:', data);

    if (data && data.length > 0) {
      const unread = data
        .filter((d: any) => d.notifications && !dismissed.has(d.notification_id))
        .map((d: any) => ({
          id: d.notification_id,
          title: d.notifications.title,
          body: d.notifications.body,
          deliveryId: d.id,
        }));

      console.log('[NotificationToast] Displaying notifications:', unread);
      setNotifications(unread);

      // Show browser notification for newly fetched notifications
      unread.forEach((notif) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notif.title, {
            body: notif.body,
            icon: '/logo.svg',
            badge: '/logo.svg',
          });
        }
      });
    }
  };

  const fetchNotificationById = async (notificationId: string, deliveryId: string) => {
    console.log('[NotificationToast] Fetching notification by ID:', notificationId);

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body')
      .eq('id', notificationId)
      .maybeSingle();

    if (error) {
      console.error('[NotificationToast] Error fetching notification:', error);
      return;
    }

    if (data && !dismissed.has(data.id)) {
      const notification: NotificationMessage = {
        id: data.id,
        title: data.title,
        body: data.body,
        deliveryId: deliveryId,
      };

      setNotifications((prev) => {
        // Check if notification already exists
        if (prev.some(n => n.id === notification.id)) {
          return prev;
        }
        return [...prev, notification];
      });

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/logo.svg',
          badge: '/logo.svg',
        });
      }

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        handleDismiss(notification.id);
      }, 10000);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    setDismissed((prev) => new Set(prev).add(notificationId));
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    const notification = notifications.find((n) => n.id === notificationId);
    if (notification?.deliveryId) {
      await supabase.rpc('mark_notification_read', {
        delivery_id: notification.deliveryId,
      });
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-xl p-4 shadow-2xl border border-teal-500/30 backdrop-blur-lg animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white mb-1">{notification.title}</h4>
              <p className="text-teal-200 text-sm">{notification.body}</p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 text-teal-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

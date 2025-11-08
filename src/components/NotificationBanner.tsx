import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, X } from 'lucide-react';

interface ActiveNotification {
  id: string;
  title: string;
  body: string;
  send_at: string;
}

export const NotificationBanner = () => {
  const [notification, setNotification] = useState<ActiveNotification | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchActiveNotification();

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchActiveNotification();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchActiveNotification();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchActiveNotification = async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, send_at')
      .eq('status', 'scheduled')
      .lte('send_at', now)
      .order('send_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setNotification(data);
      setIsDismissed(false);
    } else {
      setNotification(null);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!notification || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg overflow-hidden">
      <div className="relative flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Bell className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-bold text-sm mb-1">{notification.title}</div>
            <div className="text-sm opacity-90 whitespace-nowrap">
              <span className="inline-block animate-marquee">
                {notification.body} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; {notification.body}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-1 bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 animate-pulse"></div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

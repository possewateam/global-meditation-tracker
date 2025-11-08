import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UseSessionCleanupProps {
  sessionId: string | null;
  startTime: Date | null;
  isActive: boolean;
  onStop: () => Promise<void>;
}

export const useSessionCleanup = ({
  sessionId,
  startTime,
  isActive,
  onStop,
}: UseSessionCleanupProps) => {
  const lastHeartbeatRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!isActive || !sessionId || !startTime) {
      localStorage.removeItem('activeSession');
      return;
    }

    localStorage.setItem('activeSession', JSON.stringify({
      sessionId,
      startTime: startTime.toISOString(),
    }));

    const sendStopBeacon = () => {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const stopData = {
        sessionId,
        duration,
        endTime: endTime.toISOString(),
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      };

      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stop-meditation`;

        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(stopData)], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(stopData),
            keepalive: true,
          });
        }

        localStorage.removeItem('activeSession');
      } catch (error) {
        console.error('Failed to send stop beacon:', error);
      }
    };

    const handleBeforeUnload = () => {
      sendStopBeacon();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendStopBeacon();
      } else if (document.visibilityState === 'visible') {
        lastHeartbeatRef.current = new Date();
      }
    };

    const handlePageHide = () => {
      sendStopBeacon();
    };

    const updateHeartbeat = async () => {
      if (!sessionId) return;

      const now = new Date();
      lastHeartbeatRef.current = now;

      await supabase
        .from('meditation_sessions')
        .update({ last_heartbeat: now.toISOString() })
        .eq('id', sessionId)
        .eq('is_active', true);
    };

    updateHeartbeat();
    const heartbeatInterval = setInterval(updateHeartbeat, 5000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, sessionId, startTime]);
};

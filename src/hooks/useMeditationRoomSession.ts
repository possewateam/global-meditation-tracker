import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UseMeditationRoomSessionProps {
  sessionId: string | null;
  startTime: Date | null;
  isActive: boolean;
  onStop: () => void;
}

export const useMeditationRoomSession = ({
  sessionId,
  startTime,
  isActive,
  onStop,
}: UseMeditationRoomSessionProps) => {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && sessionId) {
      localStorage.setItem(
        'activeRoomSession',
        JSON.stringify({
          sessionId,
          startTime: startTime?.toISOString(),
        })
      );

      heartbeatIntervalRef.current = setInterval(async () => {
        await supabase
          .from('meditation_room_sessions')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('is_active', true);
      }, 5000);

      const handleBeforeUnload = () => {
        if (cleanupTimeoutRef.current) {
          clearTimeout(cleanupTimeoutRef.current);
        }

        cleanupTimeoutRef.current = setTimeout(() => {
          onStop();
        }, 100);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        if (cleanupTimeoutRef.current) {
          clearTimeout(cleanupTimeoutRef.current);
        }
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    } else {
      localStorage.removeItem('activeRoomSession');

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }
  }, [isActive, sessionId, startTime, onStop]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && isActive && sessionId) {
        await supabase
          .from('meditation_room_sessions')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('id', sessionId)
          .eq('is_active', true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, sessionId]);

  useEffect(() => {
    return () => {
      if (isActive && sessionId) {
        onStop();
      }
    };
  }, []);
};

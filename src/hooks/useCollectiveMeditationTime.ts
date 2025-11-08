import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CollectiveTimeStats {
  todayMinutes: number;
  collectiveMinutes: number;
}

export const useCollectiveMeditationTime = () => {
  const [stats, setStats] = useState<CollectiveTimeStats>({
    todayMinutes: 0,
    collectiveMinutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollectiveTime = async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      const { data, error: rpcError } = await supabase
        .rpc('get_meditation_totals', { tz });

      if (rpcError) {
        console.error('[CollectiveTime] Error fetching meditation totals:', rpcError);
        setError(rpcError.message);
        throw rpcError;
      }

      const row = Array.isArray(data) ? data[0] : data;

      const newStats = {
        todayMinutes: Number(row?.today_minutes ?? 0),
        collectiveMinutes: Number(row?.total_minutes ?? 0),
      };

      console.log('[CollectiveTime] Stats updated:', newStats);
      setStats(newStats);
      setError(null);
      setIsLoading(false);
    } catch (error) {
      console.error('[CollectiveTime] Exception fetching collective meditation time:', error);
      setStats({
        todayMinutes: 0,
        collectiveMinutes: 0,
      });
      setError(error instanceof Error ? error.message : 'Failed to load totals');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectiveTime();

    // Subscribe to meditation_sessions changes for real-time updates
    const meditationChannel = supabase
      .channel('meditation_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meditation_sessions' },
        () => {
          fetchCollectiveTime();
        }
      )
      .subscribe();

    // Subscribe to daily_totals changes for lifetime total updates
    const dailyTotalsChannel = supabase
      .channel('daily_totals_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_totals' },
        () => {
          fetchCollectiveTime();
        }
      )
      .subscribe();

    // Refresh every 10 seconds for active sessions
    const interval = setInterval(() => {
      fetchCollectiveTime();
    }, 10000);

    // Check for midnight reset every minute
    const midnightCheckInterval = setInterval(() => {
      const now = new Date();
      // If it's within the first minute after midnight, refresh
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchCollectiveTime();
      }
    }, 60000);

    return () => {
      supabase.removeChannel(meditationChannel);
      supabase.removeChannel(dailyTotalsChannel);
      clearInterval(interval);
      clearInterval(midnightCheckInterval);
    };
  }, []);

  return { stats, isLoading, error, refreshStats: fetchCollectiveTime };
};

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ActiveMeditator = {
  id: string;
  user_id: string | null;
  name: string;
  city?: string | null;
  country?: string | null;
  lat: number;
  lon: number;
  started_at: string;
  bk_centre_name?: string | null;
};

export function useActiveMeditators() {
  const [items, setItems] = useState<ActiveMeditator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const { data, error: rpcError } = await supabase.rpc('get_active_meditators', {
        max_hours: 24
      });

      if (rpcError) {
        console.error('[useActiveMeditators] Error fetching active meditators:', rpcError);
        setError(rpcError.message);
        return;
      }

      const meditators = (data ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name ?? 'Yogi',
        city: r.city,
        country: r.country,
        lat: Number(r.lat),
        lon: Number(r.lon),
        started_at: r.started_at,
        bk_centre_name: r.bk_centre_name,
      }));

      console.log('[useActiveMeditators] Loaded', meditators.length, 'active meditators');
      setItems(meditators);
    } catch (err) {
      console.error('[useActiveMeditators] Exception:', err);
      setError(err instanceof Error ? err.message : 'Failed to load active meditators');
    }
  }

  useEffect(() => {
    load().finally(() => setLoading(false));

    const channel = supabase
      .channel('meditation_sessions_active')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meditation_sessions' },
        () => {
          console.log('[useActiveMeditators] Realtime update received, reloading...');
          load();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      load();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { items, loading, error, reload: load };
}

import { useEffect, useState } from 'react';
import { AnimatedCounter } from './AnimatedCounter';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseEnabled, disableSupabase } from '../lib/supabase';

export const PersonalStatsBar = () => {
  const { user } = useAuth();
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPersonalTotal = async () => {
      // If Supabase is disabled or user not available, show 0
      if (!isSupabaseEnabled() || !user?.id) {
        setTotalMinutes(0);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('meditation_sessions')
          .select('duration_seconds')
          .eq('user_id', user.id)
          .not('duration_seconds', 'is', null);

        if (error) {
          console.error('[PersonalStats] Error fetching personal totals:', error);
          setTotalMinutes(0);
          setIsLoading(false);
          return;
        }

        const totalSeconds = ((data as { duration_seconds: number | null }[]) || []).reduce(
          (sum: number, row) => sum + (row.duration_seconds ?? 0),
          0
        );

        setTotalMinutes(Math.floor(totalSeconds / 60));
        setIsLoading(false);
      } catch (e) {
        console.error('[PersonalStats] Exception fetching personal totals:', e);
        disableSupabase('Network error fetching personal totals');
        setTotalMinutes(0);
        setIsLoading(false);
      }
    };

    fetchPersonalTotal();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto mb-6">
        <div className="h-12 rounded-full bg-teal-700/30 border border-teal-500/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div className="relative overflow-hidden rounded-full px-6 py-3 bg-gradient-to-r from-teal-900/60 via-teal-800/60 to-blue-900/60 border border-teal-500/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent animate-shimmer-slow" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative inline-block w-6 h-6 md:w-7 md:h-7">
              <span className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse" />
              <img
                src="/yogi1.png"
                alt="Meditator"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="text-xs md:text-sm font-semibold text-teal-100 uppercase tracking-wider">
              My Total Meditation Time
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                <AnimatedCounter value={totalMinutes} duration={1200} />
              </div>
              <span className="text-teal-200 text-sm md:text-base">mins</span>
            </div>
          </div>
        </div>

        <div className="absolute -left-6 -top-6 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl" />
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};
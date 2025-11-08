import { useEffect, useState } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardRow {
  rank: number;
  mobile_e164: string | null;
  name: string;
  bk_centre_name: string;
  total_seconds: number;
}

type TabType = 'daily' | 'weekly' | 'monthly';

function secsToHHMM(secs: number = 0): string {
  const totalMinutes = Math.floor(secs / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const mm = minutes.toString().padStart(2, '0');
  return `${hours}:${mm}`;
}

export const LeaderboardSection = () => {
  const [tab, setTab] = useState<TabType>('daily');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisibilitySettings();

    const channel = supabase
      .channel('settings-leaderboard-visibility')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: 'key=eq.leaderboard_visible' },
        (payload: any) => {
          console.log('Leaderboard visibility changed:', payload);
          if (payload.new && typeof payload.new === 'object' && 'value' in payload.new) {
            const newVisibility = (payload.new as any).value === 'true';
            console.log('Setting leaderboard visibility to:', newVisibility);
            setVisible(newVisibility);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      loadLeaderboard(tab);
    }
  }, [tab, visible]);

  const fetchVisibilitySettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'leaderboard_visible')
      .maybeSingle();

    if (error) {
      console.error('Error fetching leaderboard visibility:', error);
      setVisible(true);
      return;
    }

    const value = (data as { value?: string | boolean } | null)?.value;
    const isVisible = value === 'true' || value === true || !data;
    console.log('Leaderboard visibility fetched:', isVisible, 'raw value:', data?.value);
    setVisible(isVisible);
  };

  const loadLeaderboard = async (which: TabType) => {
    setLoading(true);
    const fnName =
      which === 'daily'
        ? 'leaderboard_today_ist'
        : which === 'weekly'
        ? 'leaderboard_week_ist'
        : 'leaderboard_month_ist';

    try {
      // Supabase RPC type may be missing from generated Database types; cast to any for args
      const { data, error } = await supabase.rpc(fnName as any, { p_limit: 100 } as any);

      if (error) {
        console.error('Leaderboard error:', error);
        setRows([]);
      } else {
        setRows(data || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/40';
    return 'bg-white/5 border-white/10';
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-teal-500/20">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">विश्व सेवा में संगठित योगदान</h2>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'daily'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTab('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'weekly'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTab('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            tab === 'monthly'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
              : 'bg-white/10 text-teal-300 hover:bg-white/20'
          }`}
        >
          This Month
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-teal-300 animate-pulse">Loading leaderboard...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 text-sm text-teal-300/70 font-semibold mb-3 px-4">
              <div>#</div>
              <div>Name</div>
              <div>BK Centre</div>
              <div>Time</div>
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.rank}
                  className={`grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center p-4 rounded-lg border transition-all ${getRankClass(
                    row.rank
                  )}`}
                >
                  <div className="flex items-center gap-2 font-bold text-white min-w-[3rem]">
                    {getRankIcon(row.rank)}
                    <span>{row.rank}</span>
                  </div>
                  <div className="text-white font-medium truncate">{row.name || 'Anonymous'}</div>
                  <div className="text-teal-300 text-sm truncate">{row.bk_centre_name || '-'}</div>
                  <div className="text-emerald-400 font-bold tabular-nums whitespace-nowrap">
                    {secsToHHMM(Number(row.total_seconds || 0))}h
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <Trophy className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
                  <p className="text-teal-300/70 text-lg">No meditation data yet for this period</p>
                  <p className="text-teal-400/50 text-sm mt-2">
                    Start meditating to appear on the leaderboard!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-6 pt-4 border-t border-teal-500/20 text-center">
          <p className="text-teal-300/70 text-sm">
            Showing top {rows.length} meditator{rows.length !== 1 ? 's' : ''} for{' '}
            {tab === 'daily' ? 'today' : tab === 'weekly' ? 'this week' : 'this month'}
          </p>
        </div>
      )}
    </div>
  );
};

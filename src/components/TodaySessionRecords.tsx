import { useState, useEffect } from 'react';
import { Clock, Users, MapPin, Activity, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface SessionRecord {
  id: string;
  name: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  session_date: string | null;
}

export const TodaySessionRecords = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    fetchTodaySessions();

    const interval = setInterval(() => {
      fetchTodaySessions();
    }, 15000);

    const channel = supabase
      .channel('today-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meditation_sessions'
        },
        () => {
          fetchTodaySessions();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, []);

  const fetchTodaySessions = async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const now = new Date();
      const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
      const todayDateStr = localDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('id, name, location, start_time, end_time, duration_seconds, is_active, session_date')
        .eq('session_date', todayDateStr)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching today sessions:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSessions(data);
        setTotalSessions(data.length);
        setActiveSessions(data.filter(s => s.is_active).length);
      }
      setLoading(false);
    } catch (error) {
      console.error('Exception fetching today sessions:', error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null, isActive: boolean) => {
    if (isActive) {
      return t('common.active') || 'Active';
    }
    if (!seconds) return '0s';

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Today's Meditation Records</h2>
            <p className="text-purple-300 text-sm">Individual session details</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{totalSessions}</div>
            <div className="text-xs text-purple-300">Total</div>
          </div>
          {activeSessions > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{activeSessions}</div>
              <div className="text-xs text-green-300">Active</div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-purple-300">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-purple-300/30 mx-auto mb-4" />
          <p className="text-purple-300">No meditation sessions recorded today</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border ${
                session.is_active
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'border-purple-500/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-semibold">
                      {session.name || 'Anonymous'}
                    </span>
                    {session.is_active && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full border border-green-500/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-300 text-xs font-semibold">Live</span>
                      </span>
                    )}
                  </div>

                  {session.location && (
                    <div className="flex items-center gap-2 text-purple-300 text-sm mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{session.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-purple-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Started at {formatTime(session.start_time)}</span>
                    {session.end_time && !session.is_active && (
                      <>
                        <span>•</span>
                        <span>Ended at {formatTime(session.end_time)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-lg ${
                    session.is_active
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-purple-500/20 border border-purple-500/30'
                  }`}>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        session.is_active ? 'text-green-400' : 'text-white'
                      }`}>
                        {formatDuration(session.duration_seconds, session.is_active)}
                      </div>
                      <div className="text-xs text-purple-300">Duration</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

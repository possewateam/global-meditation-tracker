import { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';

type MeditationSession = Database['public']['Tables']['meditation_sessions']['Row'];

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  longestSession: number;
  averageSession: number;
}

export const MeditationHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalMinutes: 0,
    longestSession: 0,
    averageSession: 0,
  });
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, filter]);

  const getDateFilter = () => {
    const now = new Date();
    switch (filter) {
      case 'today':
        const today = new Date(now.setHours(0, 0, 0, 0));
        return today.toISOString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('duration_seconds', 'is', null)
      .order('start_time', { ascending: false });

    const dateFilter = getDateFilter();
    if (dateFilter) {
      query = query.gte('start_time', dateFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setSessions(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (sessionData: MeditationSession[]) => {
    const totalSessions = sessionData.length;
    const totalSeconds = sessionData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const longestSession = Math.floor(Math.max(...sessionData.map(s => s.duration_seconds || 0)) / 60);
    const averageSession = totalSessions > 0 ? Math.floor(totalSeconds / totalSessions / 60) : 0;

    setStats({
      totalSessions,
      totalMinutes,
      longestSession,
      averageSession,
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{t('history.title')}</h2>
        <p className="text-teal-300">{t('history.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-teal-500/30">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-teal-300" />
            <p className="text-teal-200 text-sm font-medium">{t('history.totalSessions')}</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-300" />
            <p className="text-blue-200 text-sm font-medium">{t('history.totalTime')}</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalMinutes}m</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-300" />
            <p className="text-purple-200 text-sm font-medium">{t('history.longestSession')}</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.longestSession}m</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-orange-300" />
            <p className="text-orange-200 text-sm font-medium">{t('history.averageSession')}</p>
          </div>
          <p className="text-3xl font-bold text-white">{stats.averageSession}m</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
        <div className="flex gap-2 mb-6">
          {(['all', 'today', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {t(`history.filter.${f}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/70">
            {t('common.loading')}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">{t('history.noSessions')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-teal-300" />
                      <span className="text-white font-medium">
                        {formatDate(session.start_time)}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/70">{formatTime(session.start_time)}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-400" />
                    <span className="text-2xl font-bold text-white">
                      {formatDuration(session.duration_seconds)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

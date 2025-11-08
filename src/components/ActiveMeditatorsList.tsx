import { useEffect, useState } from 'react';
import { Users, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveMeditators, type ActiveMeditator } from '../hooks/useActiveMeditators';

interface Meditator extends ActiveMeditator {
  location?: string;
  start_time?: string;
  city_town?: string | null;
  district?: string | null;
  state?: string | null;
}

const LiveTimer = ({ startTime }: { startTime: string }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateDuration = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      setDuration(diff);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <span className="text-green-400 font-mono font-semibold">
      {formatTime(duration)}
    </span>
  );
};

const formatDetailedLocation = (meditator: Meditator): string => {
  const parts: string[] = [];

  if (meditator.city) parts.push(meditator.city);
  if (meditator.country) parts.push(meditator.country);

  return parts.length > 0 ? parts.join(', ') : 'Unknown';
};

export const ActiveMeditatorsList = () => {
  const { t } = useTranslation();
  const { items: meditators, loading, error } = useActiveMeditators();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-purple-500/20">
        <div className="text-center py-8 text-purple-300">Loading active meditators...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-purple-500/20">
        <div className="text-center py-8 text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-6 h-6 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t('meditators.title')}</h2>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/40">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 font-bold text-lg">{meditators.length}</span>
        </div>
      </div>

      {meditators.length === 0 ? (
        <p className="text-purple-300 text-center py-8 italic">
          {t('meditators.beFirst')}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {meditators.map((meditator) => {
            const detailedLocation = formatDetailedLocation(meditator);
            const isRegisteredUser = !!meditator.user_id;

            return (
              <div
                key={meditator.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-102"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-lg">
                        {meditator.name || t('common.anonymous')}
                      </p>
                      {isRegisteredUser && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-400/30">
                          Registered
                        </span>
                      )}
                    </div>

                    {meditator.bk_centre_name && (
                      <p className="text-purple-200 text-sm font-medium mt-1">
                        {meditator.bk_centre_name}
                      </p>
                    )}

                    <div className="flex items-start gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                      <p className="text-purple-300 text-sm">
                        {detailedLocation}
                      </p>
                    </div>
                  </div>
                  <LiveTimer startTime={meditator.started_at} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-purple-500/20">
        <p className="text-sm text-purple-300 text-center">
          {meditators.length} {meditators.length === 1 ? t('meditators.person') : t('meditators.people')} {t('meditators.meditatingNow')}
        </p>
      </div>
    </div>
  );
};

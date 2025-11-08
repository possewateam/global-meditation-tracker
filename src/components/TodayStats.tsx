import { Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedCounter } from './AnimatedCounter';

interface TodayStatsProps {
  totalMinutes: number;
}

export const TodayStats = ({ totalMinutes }: TodayStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">{t('stats.todayTitle')}</h2>
        </div>
        <div className="flex items-center gap-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-semibold">{t('stats.live')}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
            <AnimatedCounter value={Math.floor(totalMinutes)} duration={800} />
          </div>
          <div className="text-blue-300 text-lg font-semibold mt-2">
            {t('stats.minutes')}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-4 border-t border-blue-500/20">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <p className="text-blue-300 text-xs font-medium">
          {t('stats.todayPeriod')}
        </p>
      </div>
    </div>
  );
};

import { useTranslation } from 'react-i18next';
import { useCollectiveMeditationTime } from '../hooks/useCollectiveMeditationTime';
import { Sparkles } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export const CollectiveStatsBar = () => {
  const { t } = useTranslation();
  const { stats, isLoading } = useCollectiveMeditationTime();

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
            <Sparkles className="w-5 h-5 text-teal-200 animate-pulse" />
            <span className="text-xs md:text-sm font-semibold text-teal-100 uppercase tracking-wider">
              {/* Using existing key which now maps to "Global Collective Time" */}
              {t('dashboard.globalMap')}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-100 via-cyan-50 to-teal-100">
              <AnimatedCounter value={stats.collectiveMinutes} duration={1200} />
            </div>
            <span className="text-teal-200 text-sm md:text-base">mins</span>
          </div>
        </div>

        <div className="absolute -left-6 -top-6 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl" />
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
};
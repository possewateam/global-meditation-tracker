import { useCollectiveMeditationTime } from '../hooks/useCollectiveMeditationTime';
import { Sparkles } from 'lucide-react';

export const CollectiveMeditationStats = () => {
  const { stats, isLoading } = useCollectiveMeditationTime();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600/40 to-yellow-700/40 backdrop-blur-md rounded-xl p-4 border-2 border-amber-500/60 shadow-2xl animate-pulse min-w-[220px]">
        <div className="h-16 bg-amber-400/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-600/40 to-yellow-700/40 backdrop-blur-md rounded-xl p-4 border-2 border-amber-500/60 shadow-2xl hover:shadow-amber-500/40 transition-all duration-500 group pointer-events-auto min-w-[220px]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer-slow"></div>

      <div className="relative z-10 flex items-center justify-center gap-1 mb-2">
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
        <h3 className="text-xs font-bold text-amber-100 uppercase tracking-wider">
          Lifetime Total
        </h3>
      </div>

      <div className="relative z-10 text-center">
        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 animate-gradient-x mb-1 drop-shadow-lg leading-tight">
          {stats.collectiveMinutes.toLocaleString()}
        </div>
        <div className="text-sm font-semibold text-amber-200">Global Collective Minutes</div>
      </div>

      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-300/20 rounded-full blur-2xl group-hover:bg-amber-300/30 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-300/20 rounded-full blur-2xl group-hover:bg-yellow-300/30 transition-all duration-500"></div>

    </div>
  );
};

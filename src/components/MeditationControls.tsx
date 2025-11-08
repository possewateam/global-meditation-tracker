import { Play, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMeditationTimer } from '../hooks/useMeditationTimer';

interface MeditationControlsProps {
  isActive: boolean;
  startTime: Date | null;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}

export const MeditationControls = ({
  isActive,
  startTime,
  onStart,
  onStop,
  disabled,
}: MeditationControlsProps) => {
  const { t } = useTranslation();
  const { duration, formatTime } = useMeditationTimer(isActive, startTime);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={disabled}
            className="relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            style={{
              animation: disabled ? 'none' : 'pulse-glow 2s ease-in-out infinite, soft-blink 3s ease-in-out infinite, ripple-rings 2s ease-out infinite',
              backgroundSize: '200% auto',
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: disabled ? 'none' : 'button-shimmer 3s linear infinite',
              }}
            />
            <Play className="w-7 h-7 relative z-10" />
            <span className="relative z-10">{t('meditation.startDonate')}</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-300"
          >
            <Square className="w-6 h-6" />
            {t('meditation.stop')}
          </button>
        )}
      </div>

      {isActive && (
        <div className="text-center animate-fade-in">
          <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-glow">
            {formatTime(duration)}
          </div>
          <p className="text-purple-300 text-sm mt-2">{t('meditation.yourTime')}</p>
        </div>
      )}
    </div>
  );
};

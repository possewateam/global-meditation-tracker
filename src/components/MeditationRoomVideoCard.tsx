import { useState, useEffect } from 'react';
import { Play, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface MeditationRoomVideoCardProps {
  videoId: string;
  title: string;
  youtubeUrl: string;
  onStart: () => void;
}

export const MeditationRoomVideoCard = ({
  videoId,
  title,
  youtubeUrl,
  onStart,
}: MeditationRoomVideoCardProps) => {
  const { t } = useTranslation();
  const [activeCount, setActiveCount] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    fetchActiveCount();

    const channel = supabase
      .channel(`video-${videoId}-sessions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meditation_room_sessions',
          filter: `video_id=eq.${videoId}`
        },
        () => {
          fetchActiveCount();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchActiveCount();
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [videoId]);

  useEffect(() => {
    const videoIdMatch = extractYoutubeVideoId(youtubeUrl);
    if (videoIdMatch) {
      setThumbnailUrl(`https://img.youtube.com/vi/${videoIdMatch}/hqdefault.jpg`);
    }
  }, [youtubeUrl]);

  const fetchActiveCount = async () => {
    const { data, error } = await supabase
      .from('meditation_room_sessions')
      .select('id, last_heartbeat')
      .eq('video_id', videoId)
      .eq('is_active', true);

    if (!error && data) {
      const now = new Date();
      const activeData = data.filter(session => {
        if (!session.last_heartbeat) return true;
        const lastHeartbeat = new Date(session.last_heartbeat);
        const secondsSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / 1000;
        return secondsSinceHeartbeat < 15;
      });
      setActiveCount(activeData.length);
    }
  };

  const extractYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:scale-[1.02]">
      <div className="relative aspect-video bg-black/50">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-teal-400 opacity-50" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <Users className="w-4 h-4 text-teal-300" />
          <span className="text-white font-semibold text-sm">{activeCount}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{title}</h3>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-teal-300">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {activeCount === 0
                ? t('meditationRoom.noViewers')
                : activeCount === 1
                ? t('meditationRoom.oneViewer')
                : t('meditationRoom.viewersCount', { count: activeCount })
              }
            </span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
        >
          <Play className="w-5 h-5" />
          {t('meditationRoom.startButton')}
        </button>
      </div>
    </div>
  );
};

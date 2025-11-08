import { useEffect, useState } from 'react';
import { Users, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface RoomMeditator {
  id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  start_time: string;
  last_heartbeat: string;
  user_id?: string | null;
  city_town?: string | null;
  district?: string | null;
  state?: string | null;
  country?: string | null;
  bk_centre_name?: string | null;
}

interface ActiveRoomMeditatorsListProps {
  videoId: string;
  videoTitle: string;
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

export const ActiveRoomMeditatorsList = ({ videoId, videoTitle }: ActiveRoomMeditatorsListProps) => {
  const { t } = useTranslation();
  const [meditators, setMeditators] = useState<RoomMeditator[]>([]);

  useEffect(() => {
    fetchActiveMeditators();

    const channel = supabase
      .channel(`video-${videoId}-meditators`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meditation_room_sessions',
          filter: `video_id=eq.${videoId}`
        },
        () => {
          fetchActiveMeditators();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchActiveMeditators();
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [videoId]);

  const fetchActiveMeditators = async () => {
    const { data, error } = await supabase
      .from('meditation_room_sessions')
      .select(`
        id,
        name,
        location,
        latitude,
        longitude,
        start_time,
        last_heartbeat,
        user_id,
        users (
          city_town,
          district,
          state,
          country,
          bk_centre_name
        )
      `)
      .eq('video_id', videoId)
      .eq('is_active', true)
      .order('start_time', { ascending: false });

    if (!error && data) {
      const now = new Date();
      const activeData = data
        .filter(session => {
          if (!session.last_heartbeat) return true;
          const lastHeartbeat = new Date(session.last_heartbeat);
          const secondsSinceHeartbeat = (now.getTime() - lastHeartbeat.getTime()) / 1000;
          return secondsSinceHeartbeat < 15;
        })
        .map(session => {
          const userInfo = Array.isArray(session.users) ? session.users[0] : session.users;
          return {
            ...session,
            city_town: userInfo?.city_town || null,
            district: userInfo?.district || null,
            state: userInfo?.state || null,
            country: userInfo?.country || null,
            bk_centre_name: userInfo?.bk_centre_name || null,
          };
        });
      setMeditators(activeData as RoomMeditator[]);
    }
  };

  const formatDetailedLocation = (meditator: RoomMeditator): string => {
    const parts: string[] = [];

    if (meditator.city_town) parts.push(meditator.city_town);
    if (meditator.district && meditator.district !== meditator.city_town) parts.push(meditator.district);
    if (meditator.state) parts.push(meditator.state);
    if (meditator.country) parts.push(meditator.country);

    return parts.length > 0 ? parts.join(', ') : (meditator.location || 'Unknown');
  };

  if (meditators.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-teal-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-6 h-6 text-green-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {t('meditationRoom.watchingNow')} - {videoTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/40">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-300 font-bold text-lg">{meditators.length}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {meditators.map((meditator) => {
          const detailedLocation = formatDetailedLocation(meditator);
          const isRegisteredUser = !!meditator.user_id;

          return (
            <div
              key={meditator.id}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
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
                    <p className="text-teal-200 text-sm font-medium mb-1">
                      {meditator.bk_centre_name}
                    </p>
                  )}

                  <div className="flex items-start gap-1">
                    <MapPin className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
                    <span className="text-teal-300 text-sm">{detailedLocation}</span>
                  </div>

                  {meditator.latitude && meditator.longitude && (
                    <div className="text-teal-400/60 text-xs mt-1">
                      {meditator.latitude.toFixed(4)}°, {meditator.longitude.toFixed(4)}°
                    </div>
                  )}
                </div>
                <LiveTimer startTime={meditator.start_time} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-teal-500/20">
        <p className="text-sm text-teal-300 text-center">
          {meditators.length} {meditators.length === 1 ? t('meditators.person') : t('meditators.people')} {t('meditationRoom.watchingThisVideo')}
        </p>
      </div>
    </div>
  );
};

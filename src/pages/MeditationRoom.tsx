import { useState, useEffect } from 'react';
import { ArrowLeft, X, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MeditationRoomVideoCard } from '../components/MeditationRoomVideoCard';
import { ActiveRoomMeditatorsList } from '../components/ActiveRoomMeditatorsList';
import { useMeditationRoomSession } from '../hooks/useMeditationRoomSession';
import { Database } from '../lib/database.types';
import { getGeoOrFallback } from '../utils/getGeoOrFallback';

type RoomVideo = Database['public']['Tables']['meditation_room_videos']['Row'];

interface MeditationRoomProps {
  onBack: () => void;
}

export const MeditationRoom = ({ onBack }: MeditationRoomProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [videos, setVideos] = useState<RoomVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<RoomVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchVideos();
    recoverOrphanedSession();

    const channel = supabase
      .channel('room-videos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meditation_room_videos' },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    const cleanupInterval = setInterval(async () => {
      await supabase.rpc('cleanup_stale_room_sessions');
    }, 10000);

    return () => {
      channel.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  const recoverOrphanedSession = async () => {
    const storedSession = localStorage.getItem('activeRoomSession');
    if (!storedSession) return;

    try {
      const { sessionId, startTime } = JSON.parse(storedSession);
      const start = new Date(startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);

      await supabase
        .from('meditation_room_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: duration,
          is_active: false,
          last_heartbeat: endTime.toISOString(),
        })
        .eq('id', sessionId)
        .eq('is_active', true);

      localStorage.removeItem('activeRoomSession');
    } catch (error) {
      localStorage.removeItem('activeRoomSession');
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meditation_room_videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setVideos(data);
    }
    setLoading(false);
  };

  const handleStartVideo = (video: RoomVideo) => {
    setSelectedVideo(video);
    if (user) {
      startMeditationSession(video);
    } else {
      setShowNamePrompt(true);
    }
  };

  const startMeditationSession = async (video: RoomVideo) => {
    const displayName = user ? user.name : (userName || t('common.anonymous'));

    let latitude: number;
    let longitude: number;
    let locationStr: string;

    if (user && user.latitude && user.longitude) {
      console.log('Using stored user location from registration');
      latitude = user.latitude;
      longitude = user.longitude;

      const locationParts: string[] = [];
      if (user.city_town) locationParts.push(user.city_town);
      if (user.district && user.district !== user.city_town) locationParts.push(user.district);
      if (user.state) locationParts.push(user.state);
      if (user.country) locationParts.push(user.country);

      locationStr = locationParts.length > 0 ? locationParts.join(', ') : (user.bk_centre_name || 'Unknown');
    } else {
      console.log('No stored location, fetching current location');
      const profile = {
        name: displayName,
        countryCode: user?.country_code,
        stateCode: user?.state_code,
        city: user?.city_town
      };

      const geo = await getGeoOrFallback(profile);
      latitude = geo.lat;
      longitude = geo.lng;
      locationStr = geo.city && geo.country
        ? `${geo.city}, ${geo.country}`
        : (geo.city || user?.bk_centre_name || 'Unknown');
    }

    const { data, error } = await supabase
      .from('meditation_room_sessions')
      .insert({
        video_id: video.id,
        name: displayName,
        user_id: user?.id || null,
        location: locationStr,
        latitude: latitude,
        longitude: longitude,
        start_time: new Date().toISOString(),
        is_active: true,
        last_heartbeat: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentSessionId(data.id);
      setIsPlaying(true);
      setStartTime(new Date());
      setShowNamePrompt(false);
    }
  };

  const handleStopVideo = async () => {
    if (!currentSessionId) return;

    const endTime = new Date();
    const duration = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    await supabase
      .from('meditation_room_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: duration,
        is_active: false,
        last_heartbeat: endTime.toISOString(),
      })
      .eq('id', currentSessionId);

    setIsPlaying(false);
    setCurrentSessionId(null);
    setStartTime(null);
    setSelectedVideo(null);
  };

  useMeditationRoomSession({
    sessionId: currentSessionId,
    startTime: startTime,
    isActive: isPlaying,
    onStop: handleStopVideo,
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) {
      const separator = url.includes('?') ? '&' : '?';
      return isPlaying ? `${url}${separator}autoplay=1&mute=0` : `${url}${separator}autoplay=0`;
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      const baseUrl = `https://www.youtube.com/embed/${videoId}`;
      return isPlaying ? `${baseUrl}?autoplay=1&mute=0` : `${baseUrl}?autoplay=0`;
    }

    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.backToDashboard')}
          </button>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
              {t('meditationRoom.title')}
            </h1>
            <p className="text-lg text-teal-300">
              {t('meditationRoom.subtitle')}
            </p>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-teal-500/20 text-center">
            <Play className="w-16 h-16 text-teal-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold mb-2">{t('meditationRoom.noVideos')}</h3>
            <p className="text-teal-300">{t('meditationRoom.noVideosDescription')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {videos.map((video) => (
              <MeditationRoomVideoCard
                key={video.id}
                videoId={video.id}
                title={video.title}
                youtubeUrl={video.youtube_url}
                onStart={() => handleStartVideo(video)}
              />
            ))}
          </div>
        )}
      </div>

      {showNamePrompt && selectedVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-teal-500/30">
            <h3 className="text-2xl font-bold mb-4">{t('meditationRoom.joinTitle')}</h3>
            <p className="text-teal-300 mb-6">
              {t('meditationRoom.joinDescription')}
            </p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('meditation.namePlaceholder')}
              className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-400 focus:outline-none focus:border-teal-500 transition-colors mb-6"
              onKeyPress={(e) => e.key === 'Enter' && selectedVideo && startMeditationSession(selectedVideo)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => selectedVideo && startMeditationSession(selectedVideo)}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
              >
                {t('meditation.startButton')}
              </button>
              <button
                onClick={() => {
                  setShowNamePrompt(false);
                  setSelectedVideo(null);
                }}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPlaying && selectedVideo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-7xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <button
                onClick={handleStopVideo}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg font-semibold transition-all border border-red-500/30"
              >
                <X className="w-5 h-5" />
                {t('meditation.stop')}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    src={getEmbedUrl(selectedVideo.youtube_url)}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="lg:col-span-1">
                <ActiveRoomMeditatorsList
                  videoId={selectedVideo.id}
                  videoTitle={selectedVideo.title}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Play, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/LanguageSelector';

interface GoodWishesProps {
  onBack: () => void;
}

interface GoodWishesVideo {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number | null;
  created_at: string;
}

export const GoodWishes = ({ onBack }: GoodWishesProps) => {
  const [videos, setVideos] = useState<GoodWishesVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<GoodWishesVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('good_wishes_videos')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, search]);

  // Fallback video configuration for when no active videos exist
  const DEFAULT_GW_VIDEO_URL = 'https://www.youtube.com/watch?v=KSERWqXhPfI';
  const DEFAULT_GW_VIDEO_TITLE = 'Good Wishes - BK Santosh Didi - Russia';

  const fallbackVideo: GoodWishesVideo | null = useMemo(() => {
    if (!DEFAULT_GW_VIDEO_URL) return null;
    return {
      id: 'fallback',
      title: DEFAULT_GW_VIDEO_TITLE,
      youtube_url: DEFAULT_GW_VIDEO_URL,
      thumbnail_url: null,
      is_active: true,
      order_index: 0,
      created_at: new Date().toISOString(),
    };
  }, []);

  const displayVideos = useMemo(() => {
    if (filteredVideos.length > 0) return filteredVideos;
    return fallbackVideo ? [fallbackVideo] : [];
  }, [filteredVideos, fallbackVideo]);

  const extractYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getEmbedAutoplayUrl = (url: string) => {
    if (!url) return '';
    const id = extractYoutubeVideoId(url);
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0`;
    if (url.includes('embed')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}autoplay=1&mute=0`;
    }
    return '';
  };

  const getThumbnail = (video: GoodWishesVideo) => {
    if (video.thumbnail_url) return video.thumbnail_url;
    const id = extractYoutubeVideoId(video.youtube_url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 text-white">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
            Good Wishes
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-teal-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos by title"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white/5 rounded-2xl overflow-hidden border border-teal-500/20 animate-pulse">
                  <div className="aspect-video bg-white/10" />
                  <div className="p-4">
                    <div className="h-5 bg-white/10 rounded mb-2" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-teal-300 text-lg">No videos found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="text-left bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative aspect-video bg-black/50">
                    {getThumbnail(video) ? (
                      <img
                        src={getThumbnail(video)}
                        alt={video.title}
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
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">{video.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-7xl w-full">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setSelectedVideo(null)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
                Close
              </button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-teal-500/30 shadow-2xl">
              <iframe
                src={getEmbedAutoplayUrl(selectedVideo.youtube_url)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
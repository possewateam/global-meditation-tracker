import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Play, ArrowLeft } from 'lucide-react';

interface YouTubeEmbedProps {
  isPlaying: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const YouTubeEmbed = ({ isPlaying, onFullscreenChange }: YouTubeEmbedProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVideoUrl();

    const subscription = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        () => {
          fetchVideoUrl();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setShowOverlay(false);
      enterFullscreen();
    } else {
      setShowOverlay(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);
      if (onFullscreenChange) {
        onFullscreenChange(isCurrentlyFullscreen);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  const fetchVideoUrl = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'youtube_url')
      .maybeSingle();

    if (!error && data) {
      setVideoUrl(data.value || '');
    }
    setLoading(false);
  };

  const enterFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };

  const exitFullscreen = () => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  const getEmbedUrl = () => {
    if (!videoUrl) return '';

    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      mute: '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      fs: '1',
      playsinline: '1'
    });

    if (videoUrl.includes('youtube.com/embed/')) {
      const separator = videoUrl.includes('?') ? '&' : '?';
      return `${videoUrl}${separator}${params.toString()}`;
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(youtubeRegex);

    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }

    return '';
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg animate-pulse" />
    );
  }

  const embedUrl = getEmbedUrl();

  if (!embedUrl) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg flex items-center justify-center">
        <p className="text-purple-300 text-lg">No video configured. Please set a YouTube URL in Admin Panel.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-black' : 'w-full aspect-video rounded-lg overflow-hidden shadow-2xl'} relative`}
    >
      <iframe
        ref={iframeRef}
        key={embedUrl}
        src={embedUrl}
        title="Live Meditation"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />

      {showOverlay && !isFullscreen && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-not-allowed z-10"
          onClick={(e) => e.preventDefault()}
        >
          <div className="text-center px-6 py-8 bg-gradient-to-br from-teal-900/80 to-blue-900/80 rounded-2xl border-2 border-teal-500/50 shadow-2xl max-w-md mx-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <Play className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to Begin?
            </h3>
            <p className="text-teal-200 text-lg leading-relaxed">
              Please click on <span className="font-semibold text-green-300">Start Meditation</span> button below to begin your meditation session.
            </p>
          </div>
        </div>
      )}

      {isFullscreen && isPlaying && (
        <button
          onClick={exitFullscreen}
          className="absolute top-6 left-6 z-[10000] flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/30"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      )}
    </div>
  );
};

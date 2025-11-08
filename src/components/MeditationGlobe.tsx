import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import { Maximize2, X } from 'lucide-react';
import { calculateTodayDuration } from '../utils/durationUtils';
import { supabase } from '../lib/supabase';
import { useActiveMeditators } from '../hooks/useActiveMeditators';

interface MeditatorData {
  lat: number;
  lng: number;
  name: string;
  location: string;
  startTime: string;
  todayDuration: number;
}

export const MeditationGlobe = () => {
  const { items: meditators, loading, error } = useActiveMeditators();
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState({ width: 600, height: 600 });
  const [meditatorStats, setMeditatorStats] = useState<Record<string, number>>({});
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [globeMode, setGlobeMode] = useState<'day' | 'night'>('night');

  useEffect(() => {
    const updateSize = () => {
      if (isFullscreen) {
        setGlobeSize({ width: window.innerWidth, height: window.innerHeight });
      } else {
        const width = Math.min(window.innerWidth - 40, 800);
        const height = Math.min(window.innerHeight * 0.5, 600);
        setGlobeSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = false;
      controls.enableZoom = isHovering;
      controls.enableRotate = isHovering;
      controls.enablePan = isHovering;

      controls.addEventListener('change', () => {
        const camera = globeEl.current.camera();
        if (camera && camera.position) {
          const distance = camera.position.length();
          setZoomLevel(distance);
        }
      });

      globeEl.current.pointOfView({
        lat: 20,
        lng: 78,
        altitude: 2.5
      }, 1000);
    }
  }, [isHovering]);

  useEffect(() => {
    const fetchTodayStats = async () => {
      const { supabase } = await import('../lib/supabase');

      const { data } = await supabase
        .from('meditation_sessions')
        .select('id, name, start_time, end_time, is_active');

      if (data) {
        const stats: Record<string, number> = {};
        const uniqueSessions = new Map<string, typeof data[0]>();

        data.forEach((session) => {
          uniqueSessions.set(session.id, session);
        });

        const now = new Date();

        uniqueSessions.forEach((session) => {
          const name = session.name || 'Anonymous';
          const duration = calculateTodayDuration(session.start_time, session.end_time, now);
          stats[name] = (stats[name] || 0) + duration;
        });

        setMeditatorStats(stats);
      }
    };

    fetchTodayStats();
    const interval = setInterval(fetchTodayStats, 30000);
    return () => clearInterval(interval);
  }, [meditators]);

  useEffect(() => {
    const fetchGlobeMode = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'globe_day_night_mode')
        .maybeSingle();

      if (data) {
        setGlobeMode(data.value as 'day' | 'night');
      }
    };

    fetchGlobeMode();

    const channel = supabase
      .channel('globe-mode-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: 'key=eq.globe_day_night_mode' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'value' in payload.new) {
            setGlobeMode((payload.new as any).value as 'day' | 'night');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const htmlElementsData = meditators.map((m) => ({
    lat: m.lat,
    lng: m.lon,
    name: m.name,
    location: [m.city, m.country].filter(Boolean).join(', ') || 'Unknown',
    startTime: m.started_at,
    todayDuration: meditatorStats[m.name] || 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: globeSize.height }}>
        <div className="text-teal-300 animate-pulse">Loading globe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height: globeSize.height }}>
        <div className="text-red-400">Error loading meditators: {error}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex justify-center items-center transition-all duration-300 ${
        isFullscreen ? 'bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900' : ''
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onWheel={(e) => {
        if (!isHovering) {
          return;
        }
        e.stopPropagation();
      }}
      style={{
        cursor: isHovering ? 'grab' : 'default',
        pointerEvents: isHovering ? 'auto' : 'none',
      }}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-3 transition-all duration-300 group"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        style={{ pointerEvents: 'auto' }}
      >
        {isFullscreen ? (
          <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        ) : (
          <Maximize2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      <Globe
        ref={globeEl}
        width={globeSize.width}
        height={globeSize.height}
        backgroundColor={globeMode === 'day' ? 'rgba(160, 216, 239, 0.3)' : 'rgba(0, 0, 32, 0.3)'}
        globeImageUrl={
          globeMode === 'day'
            ? 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
            : 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
        }
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        htmlElementsData={htmlElementsData}
        htmlElement={(d: MeditatorData) => {
          const el = document.createElement('div');
          const minutes = Math.floor(d.todayDuration / 60);
          const seconds = d.todayDuration % 60;
          const timeStr = `${minutes}m ${seconds}s`;

          const baseScale = 2.5;
          const scale = Math.min(zoomLevel / baseScale, 1.5);

          el.innerHTML = `
            <div style="
              position: relative;
              width: 32px;
              height: 32px;
              cursor: pointer;
              transform-origin: center center;
              transform: scale(${1 / scale});
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                animation: golden-ripple 2.5s ease-out infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
              ">
                <img
                  src="/yogi1.png"
                  alt="Meditator"
                  style="
                    width: 36px;
                    height: 36px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 1))
                           drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))
                           drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))
                           drop-shadow(0 0 30px rgba(251, 191, 36, 0.4));
                  "
                />
              </div>
              <div style="
                position: absolute;
                top: -65px;
                left: 50%;
                transform: translateX(-50%) scale(${scale});
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95));
                padding: 8px 12px;
                border-radius: 8px;
                white-space: nowrap;
                font-size: 12px;
                color: white;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s, transform 0.3s;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(251, 191, 36, 0.5);
              " class="meditator-tooltip">
                <div style="font-weight: bold; margin-bottom: 4px;">${d.name || 'Anonymous'}</div>
                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${d.location}</div>
                <div style="font-size: 10px; background: rgba(0, 0, 0, 0.3); padding: 3px 6px; border-radius: 4px; text-align: center;">
                  Today: <span style="font-weight: bold;">${timeStr}</span>
                </div>
              </div>
            </div>
          `;

          el.addEventListener('mouseenter', () => {
            const tooltip = el.querySelector('.meditator-tooltip') as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '1';
              tooltip.style.transform = 'translateX(-50%) translateY(-5px)';
            }
          });

          el.addEventListener('mouseleave', () => {
            const tooltip = el.querySelector('.meditator-tooltip') as HTMLElement;
            if (tooltip) {
              tooltip.style.opacity = '0';
              tooltip.style.transform = 'translateX(-50%) translateY(0)';
            }
          });

          return el;
        }}
        atmosphereColor="#a855f7"
        atmosphereAltitude={0.15}
        animateIn={true}
      />
    </div>
  );
};

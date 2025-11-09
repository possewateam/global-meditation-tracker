import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseEnabled, disableSupabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSessionCleanup } from '../hooks/useSessionCleanup';
import { useLanguagePreference } from '../hooks/useLanguagePreference';
import { useActiveMeditators } from '../hooks/useActiveMeditators';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { MeditationControls } from '../components/MeditationControls';
import { CollectiveStatsBar } from '../components/CollectiveStatsBar';
import { PersonalStatsBar } from '../components/PersonalStatsBar';
import { ActiveMeditatorsList } from '../components/ActiveMeditatorsList';
import { TodayStats } from '../components/TodayStats';
import { InspirationalQuotes } from '../components/InspirationalQuotes';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { NotificationToast } from '../components/NotificationToast';
import { PushNotificationPrompt } from '../components/PushNotificationPrompt';
import { LeaderboardSection } from '../components/LeaderboardSection';
import { TodaySessionRecords } from '../components/TodaySessionRecords';
import { getGeoOrFallback } from '../utils/getGeoOrFallback';

const MeditationGlobe = lazy(() => import('../components/MeditationGlobe').then(module => ({ default: module.MeditationGlobe })));


export const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  useLanguagePreference();
  const { items: activeMeditators } = useActiveMeditators();
  const [isActive, setIsActive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [showActiveMeditators, setShowActiveMeditators] = useState(true);
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => setShowGlobe(true));
    } else {
      setTimeout(() => setShowGlobe(true), 100);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      // Local-only mode: skip remote queries
      setTodayTotal(0);
      return;
    }

    fetchTodayTotal();
    recoverOrphanedSession();

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        fetchDisplaySettings();
      });
    } else {
      setTimeout(() => {
        fetchDisplaySettings();
      }, 100);
    }

    const displayChannel = supabase
      .channel('display-settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_display_settings' },
        () => {
          fetchDisplaySettings();
        }
      )
      .subscribe();

    const updateInterval = setInterval(() => {
      fetchTodayTotal();
    }, 10000);

    const cleanupInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.rpc('cleanup_stale_sessions');
        if (!error && data && data > 0) {
          fetchTodayTotal();
        }
      } catch (e: any) {
        disableSupabase('Network error during cleanup');
      }
    }, 30000);

    return () => {
      try { supabase.removeChannel(displayChannel); } catch { displayChannel.unsubscribe?.(); }
      clearInterval(updateInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  const recoverOrphanedSession = async () => {
    if (!isSupabaseEnabled()) {
      localStorage.removeItem('activeSession');
      return;
    }
    const storedSession = localStorage.getItem('activeSession');
    if (!storedSession) return;

    try {
      const { sessionId, startTime } = JSON.parse(storedSession);
      const start = new Date(startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);

      await supabase
        .from('meditation_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: duration,
          is_active: false,
          last_heartbeat: endTime.toISOString(),
        })
        .eq('id', sessionId)
        .eq('is_active', true);

      localStorage.removeItem('activeSession');
    } catch (error: any) {
      disableSupabase('Network error recovering session');
      localStorage.removeItem('activeSession');
    }
  };

  const fetchTodayTotal = async () => {
    if (!isSupabaseEnabled()) {
      setTodayTotal(0);
      return;
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const { data, error } = await supabase.rpc('get_meditation_totals', { tz });

      if (error) {
        console.error('[Dashboard] Error fetching today total:', error);
        setTodayTotal(0);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      const totalMinutes = Math.floor(Number(row?.today_minutes ?? 0));
      console.log('[Dashboard] Today\'s total updated:', totalMinutes, 'minutes');
      setTodayTotal(totalMinutes);
    } catch (error: any) {
      console.error('[Dashboard] Exception fetching today total:', error);
      disableSupabase('Network error fetching totals');
      setTodayTotal(0);
    }
  };


  const fetchDisplaySettings = async () => {
    if (!isSupabaseEnabled()) return;
    try {
      const { data } = await supabase
        .from('admin_display_settings')
        .select('show_active_meditators')
        .maybeSingle();

      if (data) {
        setShowActiveMeditators(data.show_active_meditators ?? true);
      }
    } catch (e: any) {
      disableSupabase('Network error fetching display settings');
    }
  };

  const handleStartMeditation = () => {
    if (user) {
      startMeditationSession();
    } else {
      setShowNamePrompt(true);
    }
  };

  const startMeditationSession = async () => {
    if (!isSupabaseEnabled()) {
      alert('Remote database unavailable. Please try again later.');
      return;
    }
    const displayName = user ? user.name : (userName || t('common.anonymous'));
    const userLocation = user?.bk_centre_name || 'Unknown';

    let latitude: number;
    let longitude: number;
    let locationStr: string;

    if (user && user.latitude && user.longitude) {
      console.log('Using stored user location from profile');
      latitude = user.latitude;
      longitude = user.longitude;
      locationStr = userLocation;
    } else {
      console.log('No stored location, fetching current location');
      const profile = {
        name: displayName,
        countryCode: user?.country_code ?? undefined,
        stateCode: user?.state_code ?? undefined,
        city: user?.city_town ?? undefined,
      };

      const geo = await getGeoOrFallback(profile);
      latitude = geo.lat;
      longitude = geo.lng;
      locationStr = geo.city && geo.country
        ? `${geo.city}, ${geo.country}`
        : (geo.city || userLocation);

      if (latitude === 0 && longitude === 0) {
        console.warn('Using (0,0) coordinates - geolocation and fallback both failed');
      }
    }

    const startTime = new Date().toISOString();
    const sessionDate = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert({
        name: displayName,
        location: locationStr,
        latitude: latitude,
        longitude: longitude,
        start_time: startTime,
        session_date: sessionDate,
        is_active: true,
        user_id: user?.id || null,
        last_heartbeat: startTime,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert failed:', error);
      alert('Failed to start meditation: ' + error.message);
      return;
    }

    if (data) {
      console.log('Session started:', data);
      setCurrentSessionId(data.id);
      setIsActive(true);
      setStartTime(new Date());
      setShowNamePrompt(false);

      localStorage.setItem('activeSession', JSON.stringify({
        sessionId: data.id,
        startTime: startTime
      }));
    }
  };


  const handleStopMeditation = async () => {
    if (!currentSessionId) return;
    if (!isSupabaseEnabled()) {
      setIsActive(false);
      setCurrentSessionId(null);
      setStartTime(null);
      localStorage.removeItem('activeSession');
      return;
    }

    const endTime = new Date();
    const duration = startTime
      ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      : 0;

    const { error } = await supabase
      .from('meditation_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_seconds: duration,
        is_active: false,
        last_heartbeat: endTime.toISOString(),
      })
      .eq('id', currentSessionId);

    if (error) {
      console.error('Stop failed:', error);
      alert('Failed to stop meditation: ' + error.message);
      return;
    }

    console.log('Session stopped');
    setIsActive(false);
    setCurrentSessionId(null);
    setStartTime(null);
    localStorage.removeItem('activeSession');
  };

  useSessionCleanup({
    sessionId: currentSessionId,
    startTime: startTime,
    isActive: isActive,
    onStop: handleStopMeditation,
  });

  return (
    <>
      <NotificationToast />
      <PushNotificationPrompt />
      <div className="container mx-auto px-4 py-8">
        {/* Global Collective Time stats bar directly below navbar */}
        <CollectiveStatsBar />
        {/* Personal Total Meditation Time stats bar */}
        <PersonalStatsBar />
        {/* Map moved below YouTube embed as requested */}

        {/* Language selector moved into hamburger menu */}

      <AnnouncementBar />

        <div className="max-w-6xl mx-auto mb-8">
          <MeditationControls
            isActive={isActive}
            startTime={startTime}
            onStart={handleStartMeditation}
            onStop={handleStopMeditation}
            disabled={false}
          />
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <YouTubeEmbed isPlaying={isActive} />
        </div>

        {/* Global Meditation Map placed below YouTube embed */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-teal-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-teal-500/20 relative">
            {/* Heading removed as requested; overlay stats card hidden */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">Live -विश्व सकाश सेवा</h2>
            </div>

            {showGlobe ? (
              <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                  <div className="text-teal-300 animate-pulse">Loading globe...</div>
                </div>
              }>
                <MeditationGlobe />
              </Suspense>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-teal-300">Preparing globe...</div>
              </div>
            )}
          </div>
        </div>

        {/* Live meditators pill moved below the globe */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 font-semibold text-lg">
              {t('dashboard.liveCount', { count: activeMeditators.length })}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-8" id="active-meditators">
          <div className="space-y-6">
            {showActiveMeditators && <ActiveMeditatorsList />}
            <TodayStats totalMinutes={todayTotal} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto mb-8" id="top-100-list">
          <LeaderboardSection />
        </div>

        <div className="max-w-7xl mx-auto mb-8" id="today-records">
          <TodaySessionRecords />
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <InspirationalQuotes />
        </div>

        <footer className="mt-12 pb-4">
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/yogi1.png"
                alt="Meditation Icon"
                className="w-12 h-12 animate-pulse filter drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]"
              />
              <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
                {t('dashboard.title')}
              </h2>
            </div>
            <p className="text-lg md:text-xl text-teal-300 font-light">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="text-center text-teal-400 text-sm">
            <p>{t('dashboard.footerText')}</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <a
                href="/admin"
                className="text-teal-300 hover:text-teal-200 transition-colors inline-block"
              >
                {t('common.admin')}
              </a>
              <span className="text-teal-500">|</span>
              <a
                href="https://www.brahmakumaris.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-teal-200 transition-colors inline-block"
              >
                Brahmakumaris
              </a>
            </div>

            {/* HelpDesk WhatsApp footer highlight */}
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 font-semibold drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">
                HelpDesk Only Whatsapp No- 8016701999 (Message Only)
              </span>
            </div>
          </div>
        </footer>
      </div>

      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-teal-900 to-blue-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-teal-500/30">
            <h3 className="text-2xl font-bold mb-4">{t('meditation.joinTitle')}</h3>
            <p className="text-teal-300 mb-6">
              {t('meditation.joinDescription')}
            </p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('meditation.namePlaceholder')}
              className="w-full px-4 py-3 bg-white/10 border border-teal-500/30 rounded-lg text-white placeholder-teal-400 focus:outline-none focus:border-teal-500 transition-colors mb-6"
              onKeyPress={(e) => e.key === 'Enter' && startMeditationSession()}
            />
            <div className="flex gap-4">
              <button
                onClick={startMeditationSession}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
              >
                {t('meditation.startButton')}
              </button>
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

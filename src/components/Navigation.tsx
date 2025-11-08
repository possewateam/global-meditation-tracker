import { useState, useEffect } from 'react';
import { Home, History, LogOut, HelpCircle, Video, User, Menu, Users, Trophy, Calendar, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { LanguageSelector } from './LanguageSelector';

interface NavigationProps {
  currentPage: 'dashboard' | 'history' | 'room' | 'profile' | 'goodwishes';
  onNavigate: (page: 'dashboard' | 'history' | 'help' | 'room' | 'profile' | 'goodwishes') => void;
}

export const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [showMeditationRoom, setShowMeditationRoom] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDisplaySettings = async () => {
      if (!isSupabaseEnabled()) {
        setShowMeditationRoom(true);
        return;
      }
      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'meditation_room_visible')
        .maybeSingle();

      if (settingsData) {
        const value = (settingsData as { value?: string | boolean }).value;
        setShowMeditationRoom(value === 'true' || value === true);
      } else {
        const { data: adminData } = await supabase
          .from('admin_display_settings')
          .select('show_meditation_room')
          .maybeSingle();

        if (adminData) {
          const show = (adminData as { show_meditation_room?: boolean }).show_meditation_room;
          setShowMeditationRoom(show ?? true);
        }
      }
    };

    fetchDisplaySettings();

    if (!isSupabaseEnabled()) return;

    const channel = supabase
      .channel('meditation-room-visibility')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings', filter: 'key=eq.meditation_room_visible' },
        (payload: any) => {
          if (payload.new && typeof payload.new === 'object' && 'value' in payload.new) {
            setShowMeditationRoom((payload.new as any).value === 'true');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_display_settings' },
        (payload: any) => {
          if (payload.new && typeof payload.new === 'object' && 'show_meditation_room' in payload.new) {
            setShowMeditationRoom((payload.new as any).show_meditation_room ?? true);
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch { channel.unsubscribe?.(); }
    };
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">{t('nav.dashboard')}</span>
            </button>
            <button
              onClick={() => onNavigate('goodwishes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'goodwishes'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label="Good Wishes"
            >
              <Youtube className="w-5 h-5" />
              <span className="hidden sm:inline">Good Wishes</span>
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'history'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              aria-label="History"
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">{t('nav.history')}</span>
            </button>
          </div>
          <div className="relative">
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-white/90 hover:text-white hover:bg-white/10 border border-white/10"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">Menu</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/20 bg-black/60 backdrop-blur-xl shadow-xl p-2 z-50">
                {/* Smooth scroll helper */}
                {(() => {
                  const scrollToSection = (id: string) => {
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  };
                  const handleSectionNavigate = (id: string) => {
                    setMenuOpen(false);
                    if (currentPage !== 'dashboard') {
                      onNavigate('dashboard');
                      setTimeout(() => scrollToSection(id), 400);
                    } else {
                      scrollToSection(id);
                    }
                  };
                  return (
                    <>
                      <button
                        onClick={() => handleSectionNavigate('active-meditators')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        <Users className="w-4 h-4" />
                        <span>Active Meditators</span>
                      </button>

                      <button
                        onClick={() => handleSectionNavigate('top-100-list')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Top 100 Meditators List</span>
                      </button>

                      <button
                        onClick={() => handleSectionNavigate('today-records')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Today's Meditation Records</span>
                      </button>

                      <div className="my-1 h-px bg-white/10" />
                    </>
                  );
                })()}

                {/* Language selector moved into hamburger menu */}
                <div className="px-2 py-2">
                  <LanguageSelector />
                </div>

                <button
                  onClick={() => { setMenuOpen(false); onNavigate('history'); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                    currentPage === 'history' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>{t('nav.history')}</span>
                </button>

                <button
                  onClick={() => { setMenuOpen(false); onNavigate('goodwishes'); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                    currentPage === 'goodwishes' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Youtube className="w-4 h-4" />
                  <span>Good Wishes</span>
                </button>

                {showMeditationRoom && (
                  <button
                    onClick={() => { setMenuOpen(false); onNavigate('room'); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                      currentPage === 'room' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{t('nav.room')}</span>
                  </button>
                )}

                <button
                  onClick={() => { setMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                    currentPage === 'profile' ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.profile')}</span>
                </button>

                <button
                  onClick={() => { setMenuOpen(false); onNavigate('help'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Project Help</span>
                </button>

                <div className="my-1 h-px bg-white/10" />

                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition text-red-300 hover:bg-red-500/20 hover:text-red-200 border border-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

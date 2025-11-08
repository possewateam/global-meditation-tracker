import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Navigation } from './components/Navigation';
import { NotificationBanner } from './components/NotificationBanner';
import type { LocationData } from './utils/location';

const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const MeditationHistory = lazy(() => import('./pages/MeditationHistory').then(m => ({ default: m.MeditationHistory })));
const HelpPage = lazy(() => import('./pages/HelpPage').then(m => ({ default: m.HelpPage })));
const MeditationRoom = lazy(() => import('./pages/MeditationRoom').then(m => ({ default: m.MeditationRoom })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
// Explicitly include extension to satisfy TS module resolution in strict mode
const GoodWishes = lazy(() => import('./pages/GoodWishes.tsx').then(m => ({ default: m.GoodWishes })));
const LocationConsentModal = lazy(() => import('./components/LocationConsentModal').then(m => ({ default: m.LocationConsentModal })));
const GoogleProfileCompletionModal = lazy(() => import('./components/GoogleProfileCompletionModal').then(m => ({ default: m.GoogleProfileCompletionModal })));

type Page = 'login' | 'register' | 'dashboard' | 'history' | 'admin' | 'help' | 'room' | 'profile' | 'goodwishes';

const AppContent = () => {
  const { user, loading, showLocationModal, setShowLocationModal, showProfileCompletionModal, googleUserData, completeGoogleProfile, refreshUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  const handleLocationComplete = async (location: LocationData) => {
    if (import.meta.env.DEV) {
      console.log('[App] Location consent completed:', location);
    }
    setShowLocationModal(false);
    await refreshUser();
  };

  const handleLocationSkip = () => {
    if (import.meta.env.DEV) {
      console.log('[App] Location consent skipped');
    }
    setShowLocationModal(false);
  };

  if (import.meta.env.DEV) {
    console.log('[App] AppContent render:', { user: !!user, loading, currentPage });
  }

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[App] Path changed, updating page');
    }
    const path = window.location.pathname;
    if (import.meta.env.DEV) {
      console.log('[App] Current path:', path);
    }

    if (path === '/admin') {
      setCurrentPage('admin');
      return;
    }

    if (path === '/register') {
      setCurrentPage('register');
      return;
    }

    if (path === '/login') {
      setCurrentPage('login');
      return;
    }

    if (path === '/history') {
      setCurrentPage('history');
      return;
    }

    if (path === '/help') {
      setCurrentPage('help');
      return;
    }

    if (path === '/goodwishes') {
      setCurrentPage('goodwishes');
      return;
    }

    if (path === '/room') {
      setCurrentPage('room');
      return;
    }

    if (path === '/profile') {
      setCurrentPage('profile');
      return;
    }

    if (user) {
      if (import.meta.env.DEV) {
        console.log('[App] User logged in, showing dashboard');
      }
      setCurrentPage('dashboard');
    } else {
      if (import.meta.env.DEV) {
        console.log('[App] No user, showing login');
      }
      setCurrentPage('login');
    }
  }, [user]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page === 'dashboard' ? '' : page}`);
  };

  useEffect(() => {
    if (user && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
      window.history.pushState({}, '', '/');
    }
  }, [user, currentPage]);

  if (loading) {
    if (import.meta.env.DEV) {
      console.log('[App] Still loading, showing loading screen');
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const LoadingFallback = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );

  if (currentPage === 'admin') {
    if (import.meta.env.DEV) {
      console.log('[App] Rendering Admin route');
    }
    // Require Supabase-authenticated user for AdminPanel to satisfy RLS policies
    if (!user) {
      if (import.meta.env.DEV) {
        console.log('[App] No user, redirecting admin to Login');
      }
      return (
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AdminPanel />
      </Suspense>
    );
  }

  if (currentPage === 'register') {
    if (import.meta.env.DEV) {
      console.log('[App] Rendering Register');
    }
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    );
  }

  if (currentPage === 'login') {
    if (import.meta.env.DEV) {
      console.log('[App] Rendering Login');
    }
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    );
  }

  if (currentPage === 'help') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <HelpPage onBack={() => handleNavigate('dashboard')} />
      </Suspense>
    );
  }

  if (currentPage === 'goodwishes') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GoodWishes onBack={() => handleNavigate('dashboard')} />
      </Suspense>
    );
  }

  if (currentPage === 'room') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MeditationRoom onBack={() => handleNavigate('dashboard')} />
      </Suspense>
    );
  }

  if (currentPage === 'profile') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Profile onBack={() => handleNavigate('dashboard')} />
      </Suspense>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 text-white">
        <NotificationBanner />
        <Navigation
          currentPage={currentPage as 'dashboard' | 'history' | 'room' | 'profile'}
          onNavigate={(page) => handleNavigate(page)}
        />

        {currentPage === 'history' ? (
          <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="text-white text-xl">Loading...</div></div>}>
            <MeditationHistory />
          </Suspense>
        ) : (
          <Dashboard />
        )}
      </div>

      {showProfileCompletionModal && googleUserData && (
        <Suspense fallback={null}>
          <GoogleProfileCompletionModal
            isOpen={showProfileCompletionModal}
            userName={googleUserData.name}
            userEmail={googleUserData.email}
            onComplete={completeGoogleProfile}
          />
        </Suspense>
      )}

      {user && showLocationModal && (
        <Suspense fallback={null}>
          <LocationConsentModal
            isOpen={showLocationModal}
            userId={user.id}
            userProfile={{
              country_code: user.country_code || undefined,
              state_code: user.state_code || undefined,
              city: user.city_town || undefined,
              bk_centre_name: user.bk_centre_name || undefined,
            }}
            onComplete={handleLocationComplete}
            onSkip={handleLocationSkip}
          />
        </Suspense>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import { useState } from 'react';
import { MapPin, Navigation, Globe, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import {
  requestHighAccuracyLocation,
  getFallbackLocationFromProfile,
  formatLocationDisplay,
  getLocationAccuracyDescription,
  type LocationData,
  type LocationError,
  type UserProfile
} from '../utils/location';

interface LocationConsentModalProps {
  isOpen: boolean;
  userId: string;
  userProfile: UserProfile;
  onComplete: (location: LocationData) => void;
  onSkip?: () => void;
}

type LocationState = 'initial' | 'requesting' | 'success' | 'error' | 'fallback';

export const LocationConsentModal = ({
  isOpen,
  userId,
  userProfile,
  onComplete,
  onSkip
}: LocationConsentModalProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<LocationState>('initial');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAllowLocation = async () => {
    setState('requesting');
    setIsProcessing(true);
    setError(null);

    try {
      const gpsLocation = await requestHighAccuracyLocation();
      setLocation(gpsLocation);
      setState('success');

      await updateUserLocation(gpsLocation, 'granted');

      setTimeout(() => {
        onComplete(gpsLocation);
      }, 1500);
    } catch (err) {
      const locationError = err as LocationError;
      setError(locationError);

      const fallbackLocation = getFallbackLocationFromProfile(userProfile);
      setLocation(fallbackLocation);
      setState('fallback');

      const permissionStatus = locationError.code === 'PERMISSION_DENIED' ? 'denied' : 'prompt';
      await updateUserLocation(fallbackLocation, permissionStatus);

      setIsProcessing(false);
    }
  };

  const handleUseFallback = async () => {
    setIsProcessing(true);
    const fallbackLocation = getFallbackLocationFromProfile(userProfile);
    setLocation(fallbackLocation);

    await updateUserLocation(fallbackLocation, 'denied');

    setTimeout(() => {
      onComplete(fallbackLocation);
    }, 1000);
  };

  const handleSkip = async () => {
    if (onSkip) {
      await supabase
        .from('users')
        .update({
          location_consent_given: true,
          location_permission_status: 'denied',
          location_consent_date: new Date().toISOString()
        })
        .eq('id', userId);

      onSkip();
    }
  };

  const updateUserLocation = async (
    locationData: LocationData,
    permissionStatus: 'granted' | 'denied' | 'prompt'
  ) => {
    await supabase
      .from('users')
      .update({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location_source: locationData.source,
        location_accuracy: locationData.accuracy,
        location_updated_at: new Date().toISOString(),
        location_consent_given: true,
        location_permission_status: permissionStatus,
        location_consent_date: new Date().toISOString()
      })
      .eq('id', userId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="bg-gradient-to-br from-teal-900/95 to-blue-900/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-2xl border border-teal-500/30 overflow-hidden">
        {state === 'initial' && (
          <>
            <div className="p-8 text-center">
              <div className="mb-6 relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-green-500 to-teal-600 p-6 rounded-full">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                {t('location.enableTitle', 'Enable Location')}
              </h2>
              <p className="text-teal-200 text-lg mb-6 leading-relaxed">
                {t('location.enableDescription', 'Share your location to appear on our live global meditation map and connect with meditators worldwide.')}
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 space-y-4 text-left border border-white/20">
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {t('location.highAccuracy', 'High Accuracy GPS')}
                    </p>
                    <p className="text-teal-300 text-sm">
                      {t('location.highAccuracyDesc', 'Get precise location for accurate map display')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {t('location.globalMap', 'Global Connection')}
                    </p>
                    <p className="text-teal-300 text-sm">
                      {t('location.globalMapDesc', 'See and be seen by meditators around the world')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-1">
                      {t('location.privacy', 'Your Privacy Matters')}
                    </p>
                    <p className="text-teal-300 text-sm">
                      {t('location.privacyDesc', 'Location is only used for the meditation map. You can change this later.')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAllowLocation}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {t('location.allowButton', 'Allow Location Access')}
                </button>

                <button
                  onClick={handleUseFallback}
                  disabled={isProcessing}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 border border-white/20"
                >
                  {t('location.useCityButton', 'Use My City Instead')}
                </button>

                {onSkip && (
                  <button
                    onClick={handleSkip}
                    className="w-full py-2 text-teal-300 hover:text-teal-200 text-sm transition-colors"
                  >
                    {t('location.skipButton', 'Skip for now')}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {state === 'requesting' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <Loader className="w-16 h-16 text-teal-400 animate-spin" />
                <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('location.requesting', 'Requesting Location...')}
            </h2>
            <p className="text-teal-300">
              {t('location.requestingDesc', 'Please allow location access in your browser when prompted.')}
            </p>
          </div>
        )}

        {state === 'success' && location && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('location.success', 'Location Detected!')}
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
              <p className="text-teal-200 mb-2">
                {formatLocationDisplay(location)}
              </p>
              <p className="text-teal-400 text-sm">
                {t('location.accuracy', 'Accuracy')}: {getLocationAccuracyDescription(location.accuracy)}
              </p>
              {location.accuracy && (
                <p className="text-teal-500 text-xs mt-1">
                  ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
            <p className="text-green-400 font-semibold">
              {t('location.redirecting', 'Redirecting to meditation...')}
            </p>
          </div>
        )}

        {state === 'fallback' && location && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-full">
                  <Globe className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('location.usingCity', 'Using Your City Location')}
            </h2>

            {error && (
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 mb-4 border border-orange-500/30">
                <p className="text-orange-200 text-sm">
                  {error.code === 'PERMISSION_DENIED'
                    ? t('location.permissionDenied', 'Location permission was denied')
                    : t('location.unavailable', 'GPS location unavailable')
                  }
                </p>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
              <p className="text-teal-200 mb-2">
                {formatLocationDisplay(location)}
              </p>
              <p className="text-teal-400 text-sm">
                {t('location.approximateLocation', 'Approximate location from your profile')}
              </p>
            </div>

            <button
              onClick={() => onComplete(location)}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {t('location.continueButton', 'Continue to Meditation')}
            </button>
          </div>
        )}

        {state === 'error' && !location && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              {t('location.error', 'Location Error')}
            </h2>
            <p className="text-red-300 mb-6">
              {error?.message || t('location.errorDesc', 'Could not determine your location')}
            </p>
            <button
              onClick={handleUseFallback}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              {t('location.useCityButton', 'Use My City Instead')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

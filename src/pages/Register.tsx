import { useState, FormEvent, useEffect } from 'react';
import { UserPlus, Phone, User, MapPin, Navigation, Loader, CheckCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { requestHighAccuracyLocation } from '../utils/location';
import { reverseGeocode, formatAddress, type AddressComponents } from '../utils/geocoding';

export const Register = () => {
  const { t } = useTranslation();
  const { register, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    bk_centre_name: '',
    mobile_e164: '',
  });

  const [locationData, setLocationData] = useState<AddressComponents & {
    latitude?: number;
    longitude?: number;
    location_source?: string;
    address_source?: string;
    location_accuracy?: number;
  }>({});

  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error' | 'denied'>('idle');
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    mobile_e164: '',
    bk_centre_name: '',
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    setLocationStatus('requesting');
    setLocationError('');

    try {
      const position = await requestHighAccuracyLocation();

      if (import.meta.env.DEV) {
        console.log('[Register] GPS Position:', {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        });
      }

      const geocodeResult = await reverseGeocode(position.latitude, position.longitude);

      if (import.meta.env.DEV) {
        console.log('[Register] Geocoding result:', geocodeResult);
      }

      if (geocodeResult.success) {
        const locationDataToSet = {
          ...geocodeResult,
          latitude: position.latitude,
          longitude: position.longitude,
          location_source: 'gps',
          address_source: 'gps_geocoded',
          location_accuracy: position.accuracy,
        };

        if (import.meta.env.DEV) {
          console.log('[Register] Setting location data:', locationDataToSet);
          console.log('[Register] City/Town value:', locationDataToSet.city_town);
        }

        setLocationData(locationDataToSet);
        setLocationStatus('success');
      } else {
        setLocationError(geocodeResult.error || 'Failed to get address from location');
        setLocationStatus('error');
      }
    } catch (err: any) {
      console.error('Location error:', err);
      if (err.code === 'PERMISSION_DENIED') {
        setLocationStatus('denied');
        setLocationError('Location permission denied. You can enter your location manually.');
      } else {
        setLocationStatus('error');
        setLocationError('Unable to get location. You can enter it manually.');
      }
    }
  };

  const validateName = (name: string): string => {
    if (!name) return 'Name is required';
    if (!/^[A-Za-z ]+$/.test(name)) return 'Name should only contain letters and spaces';
    return '';
  };

  const validateCentreName = (name: string): string => {
    if (!name) return 'BK Centre Name is required';
    return '';
  };

  const validateMobileNumber = (number: string): string => {
    if (!number) return 'Mobile number is required';
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length < 10) return 'Please enter a valid 10-digit mobile number';
    return '';
  };

  const isFormValid = (): boolean => {
    return (
      formData.name &&
      formData.bk_centre_name &&
      formData.mobile_e164 &&
      !validationErrors.name &&
      !validationErrors.mobile_e164 &&
      !validationErrors.bk_centre_name
    );
  };

  const handlePhoneChange = (value: string) => {
    const e164Format = value.startsWith('+') ? value : `+${value}`;

    setFormData(prev => ({
      ...prev,
      mobile_e164: e164Format,
    }));

    setValidationErrors(prev => ({
      ...prev,
      mobile_e164: validateMobileNumber(value)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const nameError = validateName(formData.name);
    const centreNameError = validateCentreName(formData.bk_centre_name);
    const mobileError = validateMobileNumber(formData.mobile_e164);

    if (nameError || centreNameError || mobileError) {
      setValidationErrors({
        name: nameError,
        bk_centre_name: centreNameError,
        mobile_e164: mobileError,
      });
      setLoading(false);
      return;
    }

    const registrationData = {
      name: formData.name,
      bk_centre_name: formData.bk_centre_name,
      mobile_e164: formData.mobile_e164,
      ...locationData,
    };

    if (import.meta.env.DEV) {
      console.log('[Register] Sending registration data:', registrationData);
      console.log('[Register] Location data:', locationData);
    }

    const result = await register(registrationData);

    if (!result.success) {
      setError(result.error || t('auth.registrationFailed'));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <UserPlus className="w-10 h-10 text-teal-300" />
            <h1 className="text-3xl font-bold text-white">{t('auth.register')}</h1>
          </div>

          <p className="text-teal-200 text-center mb-8">
            {t('auth.registerSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white mb-2 font-medium">
                <User className="w-4 h-4" />
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, name: value });
                  setValidationErrors(prev => ({ ...prev, name: validateName(value) }));
                }}
                onBlur={(e) => setValidationErrors(prev => ({ ...prev, name: validateName(e.target.value) }))}
                className={`w-full px-4 py-3 bg-white/10 border ${validationErrors.name ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`}
                placeholder={t('auth.namePlaceholder')}
                required
              />
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-2 font-medium">
                <MapPin className="w-4 h-4" />
                BK Centre Name
              </label>
              <input
                type="text"
                value={formData.bk_centre_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, bk_centre_name: value });
                  setValidationErrors(prev => ({ ...prev, bk_centre_name: validateCentreName(value) }));
                }}
                onBlur={(e) => setValidationErrors(prev => ({ ...prev, bk_centre_name: validateCentreName(e.target.value) }))}
                className={`w-full px-4 py-3 bg-white/10 border ${validationErrors.bk_centre_name ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-teal-400 transition-colors`}
                placeholder="Enter your BK Centre name"
                required
              />
              {validationErrors.bk_centre_name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.bk_centre_name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-white mb-2 font-medium">
                <Phone className="w-4 h-4" />
                {t('auth.mobileNumber')}
              </label>
              <div className="phone-input-wrapper">
                <PhoneInput
                  country={'in'}
                  value={formData.mobile_e164}
                  onChange={handlePhoneChange}
                  inputClass={validationErrors.mobile_e164 ? 'phone-input-error' : ''}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  dropdownClass="phone-input-dropdown"
                  inputProps={{
                    required: true,
                    autoFocus: false,
                  }}
                  countryCodeEditable={false}
                  disableDropdown={false}
                  enableSearch={true}
                  searchPlaceholder="Search country"
                />
              </div>
              {validationErrors.mobile_e164 && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.mobile_e164}</p>
              )}
            </div>

            <div className="hidden">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-5 h-5 text-teal-400" />
                  <h3 className="text-white font-semibold">Location Information</h3>
                </div>

                {locationStatus === 'requesting' && (
                  <div className="flex items-center gap-3 text-teal-300">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Detecting your location...</span>
                  </div>
                )}

                {locationStatus === 'success' && locationData && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-green-400 mb-2">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Location detected successfully!</p>
                        <p className="text-sm text-teal-300 mt-1">
                          {formatAddress(locationData)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {locationData.country && (
                        <div>
                          <label className="text-white/70 block mb-1">Country</label>
                          <div className="bg-white/5 px-3 py-2 rounded text-white border border-white/10">
                            {locationData.country}
                          </div>
                        </div>
                      )}
                      {locationData.state && (
                        <div>
                          <label className="text-white/70 block mb-1">State</label>
                          <div className="bg-white/5 px-3 py-2 rounded text-white border border-white/10">
                            {locationData.state}
                          </div>
                        </div>
                      )}
                      {locationData.district && (
                        <div>
                          <label className="text-white/70 block mb-1">District</label>
                          <div className="bg-white/5 px-3 py-2 rounded text-white border border-white/10">
                            {locationData.district}
                          </div>
                        </div>
                      )}
                      {locationData.city_town && (
                        <div>
                          <label className="text-white/70 block mb-1">City/Town</label>
                          <div className="bg-white/5 px-3 py-2 rounded text-white border border-white/10">
                            {locationData.city_town}
                          </div>
                        </div>
                      )}
                    </div>

                    {locationData.location_accuracy && (
                      <p className="text-xs text-teal-400 flex items-center gap-1 mt-2">
                        <Navigation className="w-3 h-3" />
                        GPS Accuracy: ±{Math.round(locationData.location_accuracy)}m
                      </p>
                    )}
                  </div>
                )}

                {(locationStatus === 'error' || locationStatus === 'denied') && (
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-orange-300 text-sm">
                      {locationError}
                    </div>
                    <button
                      type="button"
                      onClick={requestLocationPermission}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/10 text-white/70">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              {t('auth.alreadyRegistered')}{' '}
              <a href="/login" className="text-teal-300 hover:text-teal-200 font-semibold transition-colors">
                {t('auth.loginHere')}
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .phone-input-container {
          width: 100%;
        }

        .phone-input-container input {
          width: 100% !important;
          height: 48px;
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 0.5rem !important;
          color: white !important;
          font-size: 1rem;
          padding-left: 48px !important;
        }

        .phone-input-container input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .phone-input-container input:focus {
          outline: none !important;
          border-color: rgb(45, 212, 191) !important;
        }

        .phone-input-error {
          border-color: rgb(239, 68, 68) !important;
        }

        .phone-input-button {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-right: none !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
        }

        .phone-input-button:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        .phone-input-dropdown {
          background: rgb(17, 94, 89) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .phone-input-dropdown .search {
          background: rgba(255, 255, 255, 0.1) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .phone-input-dropdown .search input {
          background: transparent !important;
          color: white !important;
        }

        .phone-input-dropdown .country:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .phone-input-dropdown .country.highlight {
          background: rgba(45, 212, 191, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

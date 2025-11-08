import { useState, useEffect, FormEvent } from 'react';
import { X, User, Phone, MapPin, Navigation, Loader, CheckCircle, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { requestHighAccuracyLocation } from '../utils/location';
import { reverseGeocode, formatAddress, type AddressComponents } from '../utils/geocoding';

interface GoogleProfileCompletionModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  onComplete: (profileData: ProfileData) => Promise<{ success: boolean; error?: string }>;
}

export interface ProfileData {
  name: string;
  bk_centre_name: string;
  mobile_e164: string;
  country?: string;
  country_code?: string;
  state?: string;
  state_code?: string;
  district?: string;
  city_town?: string;
  latitude?: number;
  longitude?: number;
  location_source?: string;
  address_source?: string;
  location_accuracy?: number;
}

export const GoogleProfileCompletionModal = ({
  isOpen,
  userName,
  userEmail,
  onComplete,
}: GoogleProfileCompletionModalProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: userName,
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
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    mobile_e164: '',
    bk_centre_name: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, name: userName }));
      requestLocationPermission();
    }
  }, [isOpen, userName]);

  const requestLocationPermission = async () => {
    setLocationStatus('requesting');
    setLocationError('');

    try {
      const position = await requestHighAccuracyLocation();

      if (import.meta.env.DEV) {
        console.log('[GoogleProfileModal] GPS Position:', {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        });
      }

      const geocodeResult = await reverseGeocode(position.latitude, position.longitude);

      if (import.meta.env.DEV) {
        console.log('[GoogleProfileModal] Geocoding result:', geocodeResult);
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
          console.log('[GoogleProfileModal] Setting location data:', locationDataToSet);
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

    const profileData: ProfileData = {
      name: formData.name,
      bk_centre_name: formData.bk_centre_name,
      mobile_e164: formData.mobile_e164,
      ...locationData,
    };

    if (import.meta.env.DEV) {
      console.log('[GoogleProfileModal] Submitting profile data:', profileData);
    }

    const result = await onComplete(profileData);

    if (!result.success) {
      setError(result.error || 'Failed to complete profile. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 rounded-2xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <User className="w-10 h-10 text-teal-300" />
          <h2 className="text-3xl font-bold text-white">Complete Your Profile</h2>
        </div>

        <p className="text-teal-200 text-center mb-6">
          Welcome! Please complete your profile to continue
        </p>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/20">
          <p className="text-white/70 text-sm mb-1">Signed in with Google</p>
          <p className="text-white font-semibold">{userEmail}</p>
        </div>

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
            {loading ? t('common.loading') : 'Complete Profile'}
          </button>
        </form>
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

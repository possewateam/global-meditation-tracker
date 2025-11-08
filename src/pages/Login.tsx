import { useState, FormEvent, useRef } from 'react';
import { LogIn, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export const Login = () => {
  const { t } = useTranslation();
  const { login, signInWithGoogle } = useAuth();

  const [mobileE164, setMobileE164] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  const validateMobileNumber = (number: string): string => {
    if (!number) return 'Mobile number is required';
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length < 10) return 'Please enter a valid 10-digit mobile number';
    return '';
  };

  const isFormValid = (): boolean => {
    return mobileE164 && !validationError;
  };

  const handlePhoneChange = (value: string) => {
    const e164Format = value.startsWith('+') ? value : `+${value}`;
    setMobileE164(e164Format);
    setValidationError(validateMobileNumber(value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const mobileError = validateMobileNumber(mobileE164);
    if (mobileError) {
      setValidationError(mobileError);
      setLoading(false);
      return;
    }

    const parts = mobileE164.match(/^(\+\d+)(\d+)$/);
    if (!parts) {
      setValidationError('Invalid phone number format');
      setLoading(false);
      return;
    }

    const countryCode = parts[1];
    const mobileNumber = parts[2];

    const result = await login(mobileNumber, countryCode);

    if (!result.success) {
      setError(result.error || t('auth.loginFailed'));
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
        <div className="mb-6 text-center">
          <p className="text-white/70 text-lg mb-3">
            {t('auth.notRegistered')}{' '}
          </p>
          <a
            href="/register"
            className="inline-block px-6 py-3 text-2xl font-bold text-amber-400 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-xl border-2 border-amber-400 animate-register-blink hover:scale-110 transition-transform duration-300"
          >
            {t('auth.registerHere')}
          </a>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <LogIn className="w-10 h-10 text-teal-300" />
            <h1 className="text-3xl font-bold text-white">{t('auth.login')}</h1>
          </div>

          <p className="text-teal-200 text-center mb-8">
            {t('auth.loginSubtitle')}
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-white mb-2 font-medium">
                <Phone className="w-4 h-4" />
                {t('auth.mobileNumber')}
              </label>
              <div className="phone-input-wrapper">
                <PhoneInput
                  country={'in'}
                  value={mobileE164}
                  onChange={handlePhoneChange}
                  inputClass={validationError ? 'phone-input-error' : ''}
                  containerClass="phone-input-container"
                  buttonClass="phone-input-button"
                  dropdownClass="phone-input-dropdown"
                  inputProps={{
                    required: true,
                    autoFocus: false,
                    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const form = formRef.current;
                        if (form) {
                          if (typeof form.requestSubmit === 'function') {
                            form.requestSubmit();
                          } else {
                            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                          }
                        }
                      }
                    },
                  }}
                  countryCodeEditable={false}
                  disableDropdown={false}
                  enableSearch={true}
                  searchPlaceholder="Search country"
                />
              </div>
              {validationError && (
                <p className="text-red-400 text-sm mt-1">{validationError}</p>
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
              {loading ? t('common.loading') : t('auth.loginButton')}
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

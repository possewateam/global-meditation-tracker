import { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, Globe, Clock, Navigation as NavigationIcon, Edit2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface ProfileProps {
  onBack: () => void;
}

export const Profile = ({ onBack }: ProfileProps) => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editedName, setEditedName] = useState('');
  const [editedCentreName, setEditedCentreName] = useState('');
  const [editedMobile, setEditedMobile] = useState('');
  const [errors, setErrors] = useState<{ name?: string; centreName?: string; mobile?: string }>({});

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('profile.notAvailable');
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleEditClick = () => {
    setEditedName(user.name || '');
    setEditedCentreName(user.bk_centre_name || '');
    setEditedMobile(user.mobile_e164 || '');
    setErrors({});
    setMessage(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setMessage(null);
  };

  const validateForm = () => {
    const newErrors: { name?: string; centreName?: string; mobile?: string } = {};

    if (!editedName.trim()) {
      newErrors.name = t('profile.nameRequired');
    }

    if (!editedCentreName.trim()) {
      newErrors.centreName = t('profile.centreNameRequired');
    }

    if (!editedMobile.trim() || !editedMobile.startsWith('+')) {
      newErrors.mobile = t('profile.invalidMobile');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const result = await updateUserProfile({
      name: editedName,
      bk_centre_name: editedCentreName,
      mobile_e164: editedMobile,
    });

    setIsSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 5000);
    } else {
      setMessage({ type: 'error', text: result.error || t('profile.updateError') });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <User className="w-10 h-10 text-teal-300" />
                <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('profile.editButton')}
                </button>
              )}
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-100'
                  : 'bg-red-500/20 border border-red-500/50 text-red-100'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('profile.personalInfo')}
                </h2>
                <div className="bg-white/5 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t('profile.name')}</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full bg-white/10 px-4 py-3 rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                            placeholder={t('profile.name')}
                          />
                          {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                          <User className="w-5 h-5 text-teal-400" />
                          <span className="text-white font-medium">{user.name || t('profile.notAvailable')}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t('profile.mobileNumber')}</label>
                      {isEditing ? (
                        <div>
                          <PhoneInput
                            country={'in'}
                            value={editedMobile}
                            onChange={(phone) => setEditedMobile(phone.startsWith('+') ? phone : `+${phone}`)}
                            inputStyle={{
                              width: '100%',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '0.5rem',
                              color: 'white',
                              padding: '0.75rem 3rem',
                              fontSize: '1rem',
                            }}
                            buttonStyle={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '0.5rem 0 0 0.5rem',
                            }}
                            dropdownStyle={{
                              background: '#1e293b',
                              color: 'white',
                            }}
                            containerClass="phone-input-container"
                            enableSearch
                            searchPlaceholder="Search country..."
                          />
                          {errors.mobile && (
                            <p className="text-red-400 text-sm mt-1">{errors.mobile}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                          <Phone className="w-5 h-5 text-teal-400" />
                          <span className="text-white font-medium">{user.mobile_e164 || t('profile.notAvailable')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.email && (
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t('profile.email')}</label>
                      <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                        <Globe className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">{user.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {t('profile.bkCentreInfo')}
                </h2>
                <div className="bg-white/5 rounded-xl p-6">
                  <div>
                    <label className="text-white/70 text-sm mb-2 block">{t('profile.bkCentreName')}</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          value={editedCentreName}
                          onChange={(e) => setEditedCentreName(e.target.value)}
                          className="w-full bg-white/10 px-4 py-3 rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                          placeholder={t('profile.bkCentreName')}
                        />
                        {errors.centreName && (
                          <p className="text-red-400 text-sm mt-1">{errors.centreName}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                        <MapPin className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">{user.bk_centre_name || t('profile.notAvailable')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {isEditing && (
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('profile.cancelEdit')}
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-500 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {isSaving ? t('common.saving') : t('profile.saveChanges')}
                  </button>
                </div>
              )}

              {/* Location Information Section - Hidden but preserved in code */}
              {false && (
                <section>
                  <h2 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {t('profile.locationInfo')}
                  </h2>
                  <div className="bg-white/5 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.country && (
                        <div>
                          <label className="text-white/70 text-sm mb-2 block">{t('profile.country')}</label>
                          <div className="bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                            <span className="text-white font-medium">{user.country}</span>
                          </div>
                        </div>
                      )}

                      {user.state && (
                        <div>
                          <label className="text-white/70 text-sm mb-2 block">{t('profile.state')}</label>
                          <div className="bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                            <span className="text-white font-medium">{user.state}</span>
                          </div>
                        </div>
                      )}

                      {user.district && (
                        <div>
                          <label className="text-white/70 text-sm mb-2 block">{t('profile.district')}</label>
                          <div className="bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                            <span className="text-white font-medium">{user.district}</span>
                          </div>
                        </div>
                      )}

                      {user.city_town && (
                        <div>
                          <label className="text-white/70 text-sm mb-2 block">{t('profile.cityTown')}</label>
                          <div className="bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                            <span className="text-white font-medium">{user.city_town}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {(user.latitude !== null && user.longitude !== null) && (
                      <div>
                        <label className="text-white/70 text-sm mb-2 block">{t('profile.coordinates')}</label>
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                          <NavigationIcon className="w-5 h-5 text-teal-400" />
                          <span className="text-white font-medium">
                            {user.latitude.toFixed(6)}, {user.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    )}

                    {user.location_source && (
                      <div className="text-xs text-teal-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>
                          {t('profile.locationSource')}: {user.location_source}
                          {user.location_accuracy && ` (±${Math.round(user.location_accuracy)}m)`}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {user.last_login && (
                <section>
                  <h2 className="text-xl font-semibold text-teal-300 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t('profile.accountActivity')}
                  </h2>
                  <div className="bg-white/5 rounded-xl p-6">
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">{t('profile.lastLogin')}</label>
                      <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-lg border border-white/10">
                        <Clock className="w-5 h-5 text-teal-400" />
                        <span className="text-white font-medium">{formatDate(user.last_login)}</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

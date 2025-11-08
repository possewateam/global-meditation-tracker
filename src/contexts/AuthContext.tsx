import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import type { ProfileData } from '../components/GoogleProfileCompletionModal';

type User = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showLocationModal: boolean;
  showProfileCompletionModal: boolean;
  googleUserData: { name: string; email: string } | null;
  login: (mobileNumber: string, countryCode: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateLastLogin: () => Promise<void>;
  setShowLocationModal: (show: boolean) => void;
  refreshUser: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  completeGoogleProfile: (profileData: ProfileData) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (profileData: { name: string; bk_centre_name: string; mobile_e164: string }) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[AuthContext] Initializing auth provider');
    }

    const timeout = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.warn('[AuthContext] Auth initialization timeout - setting loading to false');
      }
      setLoading(false);
    }, 2000);

    const initializeAuth = async () => {
      try {
        await checkExistingSession();
        await handleAuthCallback();
        clearTimeout(timeout);
      } catch (error) {
        console.error('[AuthContext] Error during initialization:', error);
        setLoading(false);
        clearTimeout(timeout);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) {
        console.log('[AuthContext] Auth state changed:', event);
      }
      if (event === 'SIGNED_IN' && session?.user) {
        await handleGoogleUser(session.user);
      }
    });

    return () => {
      clearTimeout(timeout);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleAuthCallback = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await handleGoogleUser(session.user);
    }
  };

  const handleGoogleUser = async (authUser: any) => {
    try {
      if (import.meta.env.DEV) {
        console.log('[AuthContext] Handling Google user authentication');
      }
      const googleId = authUser.id;
      const email = authUser.email;
      const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || email?.split('@')[0] || 'User';

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .maybeSingle();

      if (fetchError) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Error fetching existing user:', fetchError);
        }
        setLoading(false);
        return;
      }

      if (existingUser) {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] Existing Google user found');
        }

        const isProfileIncomplete = !existingUser.mobile_e164 || existingUser.bk_centre_name === 'Not Set';

        if (isProfileIncomplete) {
          if (import.meta.env.DEV) {
            console.log('[AuthContext] Profile incomplete, showing completion modal');
          }
          setUser(existingUser);
          setGoogleUserData({ name: name, email: email });
          setShowProfileCompletionModal(true);
          setLoading(false);
          return;
        }

        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', existingUser.id);

        localStorage.setItem('userId', existingUser.id);
        setUser(existingUser);

        // Do not auto-show location consent modal on app start
        // Users can open it manually from UI if needed

        setLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('[AuthContext] New Google user, showing profile completion modal');
      }

      setGoogleUserData({ name: name, email: email });
      setShowProfileCompletionModal(true);
      setLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Exception in handleGoogleUser:', error);
      }
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('[AuthContext] Checking for existing session');
      }
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] Found stored user ID, fetching user data');
        }
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', storedUserId)
          .maybeSingle();

        if (error) {
          if (import.meta.env.DEV) {
            console.error('[AuthContext] Error fetching user:', error);
          }
          localStorage.removeItem('userId');
        } else if (data) {
          if (import.meta.env.DEV) {
            console.log('[AuthContext] User session restored');
          }
          setUser(data);
        } else {
          if (import.meta.env.DEV) {
            console.log('[AuthContext] User not found, clearing session');
          }
          localStorage.removeItem('userId');
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('[AuthContext] No stored user ID found');
        }
      }
      setLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Exception in checkExistingSession:', error);
      }
      setLoading(false);
    }
  };

  const login = async (mobileNumber: string, countryCode: string): Promise<{ success: boolean; error?: string }> => {
    const mobileE164 = `${countryCode}${mobileNumber}`.trim();

    if (!mobileE164 || !mobileE164.startsWith('+')) {
      return { success: false, error: 'Please enter a valid mobile number' };
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('mobile_e164', mobileE164)
      .maybeSingle();

    if (error) {
      return { success: false, error: 'Failed to login. Please try again.' };
    }

    if (!data) {
      return { success: false, error: 'Mobile number not registered. Please register first.' };
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    localStorage.setItem('userId', data.id);
    setUser(data);

    // Do not auto-show location consent modal on app start
    // Users can open it manually from UI if needed

    return { success: true };
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    const mobileE164 = userData.mobile_e164.trim();

    if (!mobileE164 || !mobileE164.startsWith('+')) {
      return { success: false, error: 'Please enter a valid mobile number' };
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('mobile_e164', mobileE164)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'This mobile number is already registered. Please login.' };
    }

    const userRecord: any = {
      mobile_e164: mobileE164,
      name: userData.name.trim(),
      bk_centre_name: userData.bk_centre_name.trim(),
    };

    if (userData.country) userRecord.country = userData.country;
    if (userData.country_code) userRecord.country_code = userData.country_code;
    if (userData.state) userRecord.state = userData.state;
    if (userData.state_code) userRecord.state_code = userData.state_code;
    if (userData.district) userRecord.district = userData.district;
    if (userData.city_town) userRecord.city_town = userData.city_town;
    if (userData.latitude !== undefined) userRecord.latitude = userData.latitude;
    if (userData.longitude !== undefined) userRecord.longitude = userData.longitude;
    if (userData.location_source) userRecord.location_source = userData.location_source;
    if (userData.address_source) userRecord.address_source = userData.address_source;
    if (userData.location_accuracy !== undefined) userRecord.location_accuracy = userData.location_accuracy;

    if (userData.country || userData.state || userData.district || userData.city_town) {
      userRecord.address_updated_at = new Date().toISOString();
    }
    if (userData.latitude !== undefined || userData.longitude !== undefined) {
      userRecord.location_updated_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(userRecord, { onConflict: 'mobile_e164' })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }

    localStorage.setItem('userId', data.id);
    setUser(data);
    setShowLocationModal(true);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('activeSession');
    setUser(null);
  };

  const updateLastLogin = async () => {
    if (user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to initiate Google sign-in' };
    }
  };

  const refreshUser = async () => {
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setUser(data);
      }
    }
  };

  const completeGoogleProfile = async (profileData: ProfileData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!googleUserData) {
        return { success: false, error: 'No Google user data found' };
      }

      const mobileE164 = profileData.mobile_e164.trim();

      if (!mobileE164 || !mobileE164.startsWith('+')) {
        return { success: false, error: 'Please enter a valid mobile number' };
      }

      const { data: existingMobile } = await supabase
        .from('users')
        .select('id')
        .eq('mobile_e164', mobileE164)
        .maybeSingle();

      if (existingMobile && (!user || existingMobile.id !== user.id)) {
        return { success: false, error: 'This mobile number is already registered to another account.' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Authentication session not found' };
      }

      const googleId = session.user.id;

      const userRecord: any = {
        google_id: googleId,
        email: googleUserData.email,
        name: profileData.name.trim(),
        bk_centre_name: profileData.bk_centre_name.trim(),
        mobile_e164: mobileE164,
      };

      if (profileData.country) userRecord.country = profileData.country;
      if (profileData.country_code) userRecord.country_code = profileData.country_code;
      if (profileData.state) userRecord.state = profileData.state;
      if (profileData.state_code) userRecord.state_code = profileData.state_code;
      if (profileData.district) userRecord.district = profileData.district;
      if (profileData.city_town) userRecord.city_town = profileData.city_town;
      if (profileData.latitude !== undefined) userRecord.latitude = profileData.latitude;
      if (profileData.longitude !== undefined) userRecord.longitude = profileData.longitude;
      if (profileData.location_source) userRecord.location_source = profileData.location_source;
      if (profileData.address_source) userRecord.address_source = profileData.address_source;
      if (profileData.location_accuracy !== undefined) userRecord.location_accuracy = profileData.location_accuracy;

      if (profileData.country || profileData.state || profileData.district || profileData.city_town) {
        userRecord.address_updated_at = new Date().toISOString();
      }
      if (profileData.latitude !== undefined || profileData.longitude !== undefined) {
        userRecord.location_updated_at = new Date().toISOString();
      }

      let savedUser;
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .update(userRecord)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          if (import.meta.env.DEV) {
            console.error('[AuthContext] Error updating user:', error);
          }
          return { success: false, error: 'Failed to update profile. Please try again.' };
        }
        savedUser = data;
      } else {
        const { data, error } = await supabase
          .from('users')
          .insert(userRecord)
          .select()
          .single();

        if (error) {
          if (import.meta.env.DEV) {
            console.error('[AuthContext] Error creating user:', error);
          }
          return { success: false, error: 'Failed to create profile. Please try again.' };
        }
        savedUser = data;
      }

      if (!savedUser) {
        return { success: false, error: 'Failed to save profile' };
      }

      localStorage.setItem('userId', savedUser.id);
      setUser(savedUser);
      setShowProfileCompletionModal(false);
      setGoogleUserData(null);

      if (!savedUser.location_consent_given) {
        setShowLocationModal(true);
      }

      return { success: true };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Exception in completeGoogleProfile:', error);
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateUserProfile = async (profileData: { name: string; bk_centre_name: string; mobile_e164: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const mobileE164 = profileData.mobile_e164.trim();

      if (!mobileE164 || !mobileE164.startsWith('+')) {
        return { success: false, error: 'Please enter a valid mobile number' };
      }

      if (!profileData.name.trim()) {
        return { success: false, error: 'Name is required' };
      }

      if (!profileData.bk_centre_name.trim()) {
        return { success: false, error: 'BK Centre Name is required' };
      }

      if (mobileE164 !== user.mobile_e164) {
        const { data: existingMobile } = await supabase
          .from('users')
          .select('id')
          .eq('mobile_e164', mobileE164)
          .maybeSingle();

        if (existingMobile && existingMobile.id !== user.id) {
          return { success: false, error: 'This mobile number is already registered to another account' };
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          name: profileData.name.trim(),
          bk_centre_name: profileData.bk_centre_name.trim(),
          mobile_e164: mobileE164,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('[AuthContext] Error updating user profile:', error);
        }
        return { success: false, error: 'Failed to update profile. Please try again.' };
      }

      if (data) {
        setUser(data);
        return { success: true };
      }

      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[AuthContext] Exception in updateUserProfile:', error);
      }
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    loading,
    showLocationModal,
    showProfileCompletionModal,
    googleUserData,
    login,
    register,
    logout,
    updateLastLogin,
    signInWithGoogle,
    setShowLocationModal,
    refreshUser,
    completeGoogleProfile,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

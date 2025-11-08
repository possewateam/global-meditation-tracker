import { useState, useEffect } from 'react';
import { Save, Lock, Youtube, Plus, Edit2, Trash2, BookOpen, Mail, ArrowLeft, HelpCircle, Upload, Palette, Image, Bell, Eye, EyeOff, Sparkles, MessageSquare, Video, ArrowUp, ArrowDown, Sun, Moon, Globe as GlobeIcon, Trophy, Users, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguagePreference } from '../hooks/useLanguagePreference';
import { Database } from '../lib/database.types';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationManager } from '../components/NotificationManager';
import { DuplicateUserManagement } from '../components/DuplicateUserManagement';
import { LeaderboardManagement } from '../components/LeaderboardManagement';

type Quote = Database['public']['Tables']['quotes']['Row'];
type RoomVideo = Database['public']['Tables']['meditation_room_videos']['Row'];
type GoodWishesVideo = {
  id: string;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  order_index: number | null;
  created_at: string;
};

export const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  useLanguagePreference();
  const { colors, updateTheme } = useTheme();

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'youtube' | 'quotes' | 'help' | 'theme' | 'presets' | 'hero' | 'announcement' | 'display' | 'notifications' | 'room' | 'goodwishes' | 'duplicates' | 'leaderboard'>('youtube');

  const [helpYoutubeUrl, setHelpYoutubeUrl] = useState('');
  const [helpImageUrl, setHelpImageUrl] = useState('');
  const [helpSettingsId, setHelpSettingsId] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [newQuote, setNewQuote] = useState({ text: '', author: '', language: 'en' });
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const [themeColors, setThemeColors] = useState(colors);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroPreviewUrl, setHeroPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementId, setAnnouncementId] = useState<string | null>(null);

  const [themePresets, setThemePresets] = useState<any[]>([]);
  const [showActiveMeditators, setShowActiveMeditators] = useState(true);
  const [showMeditationRoom, setShowMeditationRoom] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [globeDayNightMode, setGlobeDayNightMode] = useState<'day' | 'night'>('night');

  const [roomVideos, setRoomVideos] = useState<RoomVideo[]>([]);
  const [editingVideo, setEditingVideo] = useState<RoomVideo | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', youtube_url: '' });
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  // Good Wishes Manager state
  const [gwVideos, setGwVideos] = useState<GoodWishesVideo[]>([]);
  const [gwEditingVideo, setGwEditingVideo] = useState<GoodWishesVideo | null>(null);
  const [gwNewVideo, setGwNewVideo] = useState({ title: '', youtube_url: '' });
  const [gwShowForm, setGwShowForm] = useState(false);

  const ADMIN_PASSWORD = 'sakash2024';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'or', name: 'Odia' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUrl();
      fetchQuotes();
      fetchHelpSettings();
      fetchHeroSettings();
      fetchAnnouncementSettings();
      fetchThemePresets();
      fetchDisplaySettings();
      fetchRoomVideos();
      fetchGoodWishesVideos();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setThemeColors(colors);
  }, [colors]);

  const fetchCurrentUrl = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'youtube_url')
      .maybeSingle();

    if (data) {
      setYoutubeUrl(data.value || '');
    }
  };

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setQuotes(data);
    }
  };

  const fetchHelpSettings = async () => {
    const { data } = await supabase
      .from('help_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setHelpSettingsId(data.id);
      setHelpYoutubeUrl(data.youtube_url || '');
      setHelpImageUrl(data.image_url || '');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: admin } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .eq('password_hash', password)
      .maybeSingle();

    if (admin || password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage(t('admin.incorrectPassword'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');

    try {
      const { data: admin } = await supabase
        .from('admin_credentials')
        .select('id, email')
        .eq('email', resetEmail)
        .maybeSingle();

      if (!admin) {
        setResetMessage('Email not found in admin records');
        setResetLoading(false);
        return;
      }

      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 3600000);

      const { error: updateError } = await supabase
        .from('admin_credentials')
        .update({
          reset_token: resetToken,
          reset_token_expires: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', admin.id);

      if (updateError) throw updateError;

      const resetLink = `${window.location.origin}/admin?reset=${resetToken}`;

      setResetMessage(
        `Password reset link has been generated:\n\n${resetLink}\n\nThis link will expire in 1 hour. Please check your email (simulated for demo).`
      );

      console.log('Password Reset Link:', resetLink);
      console.log('Reset Token:', resetToken);
    } catch (error) {
      setResetMessage('Failed to process password reset request');
      console.error(error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'youtube_url')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value: youtubeUrl, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({ key: 'youtube_url', value: youtubeUrl });

        if (error) throw error;
      }

      setMessage(t('admin.successMessage'));
    } catch (error) {
      setMessage(t('admin.errorMessage'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('quotes')
        .insert({
          text: newQuote.text,
          author: newQuote.author,
          language: newQuote.language,
          is_active: true,
        });

      if (error) throw error;

      setMessage('Quote added successfully!');
      setNewQuote({ text: '', author: '', language: 'en' });
      setShowQuoteForm(false);
      fetchQuotes();
    } catch (error) {
      setMessage('Failed to add quote');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          text: editingQuote.text,
          author: editingQuote.author,
          language: editingQuote.language,
          is_active: editingQuote.is_active,
        })
        .eq('id', editingQuote.id);

      if (error) throw error;

      setMessage('Quote updated successfully!');
      setEditingQuote(null);
      fetchQuotes();
    } catch (error) {
      setMessage('Failed to update quote');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage('Quote deleted successfully!');
      fetchQuotes();
    } catch (error) {
      setMessage('Failed to delete quote');
      console.error(error);
    }
  };

  const toggleQuoteActive = async (quote: Quote) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ is_active: !quote.is_active })
        .eq('id', quote.id);

      if (error) throw error;

      fetchQuotes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveHelpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (helpSettingsId) {
        const { error } = await supabase
          .from('help_settings')
          .update({
            youtube_url: helpYoutubeUrl,
            image_url: helpImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', helpSettingsId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('help_settings')
          .insert({
            youtube_url: helpYoutubeUrl,
            image_url: helpImageUrl,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setHelpSettingsId(data.id);
      }

      setMessage('Help settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save help settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroSettings = async () => {
    const { data } = await supabase
      .from('hero_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setHeroImageUrl(data.image_url || '');
    }
  };

  const fetchAnnouncementSettings = async () => {
    const { data } = await supabase
      .from('announcement_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setAnnouncementId(data.id);
      setAnnouncementMessage(data.message || '');
      setAnnouncementActive(data.is_active || false);
    }
  };

  const fetchThemePresets = async () => {
    const { data } = await supabase
      .from('theme_presets')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (data) {
      setThemePresets(data);
    }
  };

  const fetchDisplaySettings = async () => {
    try {
      const { data: activeMeditatorsData, error: activeMeditatorsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'active_meditators_visible')
        .maybeSingle();

      if (activeMeditatorsError) {
        console.error('Error fetching active_meditators_visible:', activeMeditatorsError);
      } else if (activeMeditatorsData) {
        console.log('Fetched active_meditators_visible:', activeMeditatorsData.value);
        setShowActiveMeditators(activeMeditatorsData.value === 'true');
      } else {
        setShowActiveMeditators(true);
      }

      const { data: meditationRoomData, error: roomError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'meditation_room_visible')
        .maybeSingle();

      if (roomError) {
        console.error('Error fetching meditation_room_visible:', roomError);
      } else if (meditationRoomData) {
        console.log('Fetched meditation_room_visible:', meditationRoomData.value);
        setShowMeditationRoom(meditationRoomData.value === 'true');
      } else {
        setShowMeditationRoom(false);
      }

      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'leaderboard_visible')
        .maybeSingle();

      if (leaderboardError) {
        console.error('Error fetching leaderboard_visible:', leaderboardError);
      } else if (leaderboardData) {
        console.log('Fetched leaderboard_visible:', leaderboardData.value);
        setShowLeaderboard(leaderboardData.value === 'true');
      } else {
        setShowLeaderboard(true);
      }

      const { data: globeModeData, error: globeError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'globe_day_night_mode')
        .maybeSingle();

      if (globeError) {
        console.error('Error fetching globe_day_night_mode:', globeError);
      } else if (globeModeData) {
        console.log('Fetched globe_day_night_mode:', globeModeData.value);
        setGlobeDayNightMode(globeModeData.value as 'day' | 'night');
      } else {
        setGlobeDayNightMode('night');
      }
    } catch (error) {
      console.error('Error in fetchDisplaySettings:', error);
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateTheme(themeColors);
      setMessage('Theme updated successfully! Changes will reflect across all pages.');
    } catch (error) {
      setMessage('Failed to update theme');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImageFile) return;

    setUploading(true);
    setMessage('');

    try {
      const fileExt = heroImageFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, heroImageFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { data: existing } = await supabase
        .from('hero_settings')
        .select('id')
        .maybeSingle();

      if (existing) {
        await supabase
          .from('hero_settings')
          .update({
            image_url: publicUrl,
            storage_path: filePath,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('hero_settings')
          .insert({
            image_url: publicUrl,
            storage_path: filePath,
          });
      }

      setHeroImageUrl(publicUrl);
      setHeroImageFile(null);
      setHeroPreviewUrl('');
      setMessage('Hero image updated successfully!');
    } catch (error) {
      setMessage('Failed to upload hero image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAnnouncementSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (announcementId) {
        await supabase
          .from('announcement_settings')
          .update({
            message: announcementMessage,
            is_active: announcementActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', announcementId);
      } else {
        const { data } = await supabase
          .from('announcement_settings')
          .insert({
            message: announcementMessage,
            is_active: announcementActive,
          })
          .select()
          .single();

        if (data) setAnnouncementId(data.id);
      }

      setMessage('Announcement saved successfully!');
    } catch (error) {
      setMessage('Failed to save announcement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = async (preset: any) => {
    setLoading(true);
    setMessage('');

    try {
      const presetColors = {
        primaryColor: preset.primary_color,
        secondaryColor: preset.secondary_color,
        accentColor: preset.accent_color,
        backgroundColor: preset.background_color,
      };

      await updateTheme(presetColors);
      setThemeColors(presetColors);
      setMessage(`${preset.name} theme applied successfully!`);
    } catch (error) {
      setMessage('Failed to apply theme preset');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplaySettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error: activeMeditatorsError } = await supabase
        .from('settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000003',
          key: 'active_meditators_visible',
          value: showActiveMeditators ? 'true' : 'false',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (activeMeditatorsError) {
        console.error('Error upserting active_meditators_visible:', activeMeditatorsError);
        throw activeMeditatorsError;
      }

      const { error: roomError } = await supabase
        .from('settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000010',
          key: 'meditation_room_visible',
          value: showMeditationRoom ? 'true' : 'false',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (roomError) {
        console.error('Error upserting meditation_room_visible:', roomError);
        throw roomError;
      }

      const { error: leaderboardError } = await supabase
        .from('settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          key: 'leaderboard_visible',
          value: showLeaderboard ? 'true' : 'false',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (leaderboardError) {
        console.error('Error upserting leaderboard_visible:', leaderboardError);
        throw leaderboardError;
      }

      const { error: globeError } = await supabase
        .from('settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000002',
          key: 'globe_day_night_mode',
          value: globeDayNightMode,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (globeError) {
        console.error('Error upserting globe_day_night_mode:', globeError);
        throw globeError;
      }

      console.log('Display settings saved successfully:', {
        showActiveMeditators,
        showMeditationRoom,
        showLeaderboard,
        globeDayNightMode
      });

      setMessage('Display settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save display settings. Check console for details.');
      console.error('Display settings save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomVideos = async () => {
    const { data: roomData } = await supabase
      .from('meditation_rooms')
      .select('id')
      .eq('is_active', true)
      .maybeSingle();

    if (roomData) {
      setRoomId(roomData.id);

      const { data } = await supabase
        .from('meditation_room_videos')
        .select('*')
        .eq('room_id', roomData.id)
        .order('display_order', { ascending: true });

      if (data) {
        setRoomVideos(data);
      }
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    setLoading(true);
    setMessage('');

    try {
      const maxOrder = roomVideos.length > 0
        ? Math.max(...roomVideos.map(v => v.display_order))
        : -1;

      const { error } = await supabase
        .from('meditation_room_videos')
        .insert({
          room_id: roomId,
          title: newVideo.title,
          youtube_url: newVideo.youtube_url,
          display_order: maxOrder + 1,
          is_active: true,
        });

      if (error) throw error;

      setMessage('Video added successfully!');
      setNewVideo({ title: '', youtube_url: '' });
      setShowVideoForm(false);
      fetchRoomVideos();
    } catch (error) {
      setMessage('Failed to add video');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('meditation_room_videos')
        .update({
          title: editingVideo.title,
          youtube_url: editingVideo.youtube_url,
          is_active: editingVideo.is_active,
        })
        .eq('id', editingVideo.id);

      if (error) throw error;

      setMessage('Video updated successfully!');
      setEditingVideo(null);
      fetchRoomVideos();
    } catch (error) {
      setMessage('Failed to update video');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('meditation_room_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage('Video deleted successfully!');
      fetchRoomVideos();
    } catch (error) {
      setMessage('Failed to delete video');
      console.error(error);
    }
  };

  const toggleVideoActive = async (video: RoomVideo) => {
    try {
      const { error } = await supabase
        .from('meditation_room_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id);

      if (error) throw error;

      fetchRoomVideos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const currentIndex = roomVideos.findIndex(v => v.id === videoId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= roomVideos.length) return;

    const currentVideo = roomVideos[currentIndex];
    const targetVideo = roomVideos[targetIndex];

    try {
      await supabase
        .from('meditation_room_videos')
        .update({ display_order: targetVideo.display_order })
        .eq('id', currentVideo.id);

      await supabase
        .from('meditation_room_videos')
        .update({ display_order: currentVideo.display_order })
        .eq('id', targetVideo.id);

      fetchRoomVideos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
  };

  // Utilities for Good Wishes
  const extractYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  };

  const getGwThumbnailFromUrl = (url: string): string | null => {
    const id = extractYoutubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  };

  const fetchGoodWishesVideos = async () => {
    const { data } = await supabase
      .from('good_wishes_videos')
      .select('*')
      .order('order_index', { ascending: true });
    setGwVideos(data || []);
  };

  const handleGwAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const maxOrder = gwVideos.length > 0
        ? Math.max(...gwVideos.map(v => v.order_index || 0))
        : -1;

      const thumb = getGwThumbnailFromUrl(gwNewVideo.youtube_url);
      const { error } = await supabase
        .from('good_wishes_videos')
        .insert({
          title: gwNewVideo.title,
          youtube_url: gwNewVideo.youtube_url,
          thumbnail_url: thumb,
          is_active: true,
          order_index: maxOrder + 1,
        });
      if (error) throw error;
      setMessage('Good Wish video added successfully!');
      setGwNewVideo({ title: '', youtube_url: '' });
      setGwShowForm(false);
      fetchGoodWishesVideos();
    } catch (error) {
      console.error(error);
      setMessage('Failed to add Good Wish video');
    } finally {
      setLoading(false);
    }
  };

  const handleGwUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwEditingVideo) return;
    setLoading(true);
    setMessage('');
    try {
      const thumb = getGwThumbnailFromUrl(gwEditingVideo.youtube_url);
      const { error } = await supabase
        .from('good_wishes_videos')
        .update({
          title: gwEditingVideo.title,
          youtube_url: gwEditingVideo.youtube_url,
          thumbnail_url: thumb,
          is_active: gwEditingVideo.is_active,
        })
        .eq('id', gwEditingVideo.id);
      if (error) throw error;
      setMessage('Good Wish video updated successfully!');
      setGwEditingVideo(null);
      fetchGoodWishesVideos();
    } catch (error) {
      console.error(error);
      setMessage('Failed to update Good Wish video');
    } finally {
      setLoading(false);
    }
  };

  const handleGwDeleteVideo = async (id: string) => {
    if (!confirm('Delete this Good Wish video?')) return;
    try {
      const { error } = await supabase
        .from('good_wishes_videos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMessage('Good Wish video deleted successfully!');
      fetchGoodWishesVideos();
    } catch (error) {
      console.error(error);
      setMessage('Failed to delete Good Wish video');
    }
  };

  const toggleGwActive = async (video: GoodWishesVideo) => {
    try {
      const { error } = await supabase
        .from('good_wishes_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id);
      if (error) throw error;
      fetchGoodWishesVideos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGwMoveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const currentIndex = gwVideos.findIndex(v => v.id === videoId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= gwVideos.length) return;

    const currentVideo = gwVideos[currentIndex];
    const targetVideo = gwVideos[targetIndex];
    try {
      await supabase
        .from('good_wishes_videos')
        .update({ order_index: targetVideo.order_index })
        .eq('id', currentVideo.id);
      await supabase
        .from('good_wishes_videos')
        .update({ order_index: currentVideo.order_index })
        .eq('id', targetVideo.id);
      fetchGoodWishesVideos();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    if (showForgotPassword) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <LanguageSelector />
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-teal-500/20 max-w-md w-full">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetMessage('');
                setResetEmail('');
              }}
              className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
            </div>

            <p className="text-teal-300 mb-6">
              Enter your admin email address and we'll send you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-teal-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              {resetMessage && (
                <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
                  resetMessage.includes('generated') || resetMessage.includes('sent')
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <a
              href="/"
              className="block text-center mt-4 text-teal-300 hover:text-teal-200 transition-colors"
            >
              {t('common.backToDashboard')}
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-teal-500/20 max-w-md w-full">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">{t('admin.loginTitle')}</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-teal-300 mb-2">{t('common.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                placeholder={t('admin.passwordPlaceholder')}
              />
            </div>

            {message && (
              <p className="text-red-400 text-sm">{message}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300"
            >
              {t('common.login')}
            </button>
          </form>

          <button
            onClick={() => setShowForgotPassword(true)}
            className="w-full mt-4 text-teal-300 hover:text-teal-200 transition-colors text-sm underline"
          >
            Forgot Password?
          </button>

          <a
            href="/"
            className="block text-center mt-4 text-teal-300 hover:text-teal-200 transition-colors"
          >
            {t('common.backToDashboard')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-teal-500/20">
          <h1 className="text-4xl font-bold text-white mb-8">{t('admin.panelTitle')}</h1>

          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'youtube'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Youtube className="w-5 h-5" />
              YouTube
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'quotes'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Quotes
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'help'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-5 h-5" />
              Help
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'theme'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Palette className="w-5 h-5" />
              Theme
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'hero'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Image className="w-5 h-5" />
              Hero
            </button>
            <button
              onClick={() => setActiveTab('announcement')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'announcement'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Bell className="w-5 h-5" />
              Announcement
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'presets'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Presets
            </button>
            <button
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'display'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Eye className="w-5 h-5" />
              Display
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Notifications
            </button>
          <button
              onClick={() => setActiveTab('room')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'room'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Video className="w-5 h-5" />
              Room
            </button>
            <button
              onClick={() => setActiveTab('goodwishes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'goodwishes'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Heart className="w-5 h-5" />
              Good Wishes
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'duplicates'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-teal-300 hover:bg-white/20'
              }`}
            >
              <Users className="w-5 h-5" />
              Duplicates
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('success')
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          {activeTab === 'youtube' && (
            <form onSubmit={handleSaveYoutube} className="space-y-6">
              <div>
                <label className="block text-teal-300 mb-2 text-lg font-semibold flex items-center gap-2">
                  <Youtube size={20} />
                  {t('admin.youtubeLabel')}
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder={t('admin.youtubePlaceholder')}
                  required
                />
                <p className="text-teal-400 text-sm mt-2">
                  {t('admin.youtubeHelper')}
                </p>
              </div>

              {youtubeUrl && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <p className="text-teal-300 text-sm mb-3 font-semibold">{t('admin.preview')}</p>
                  {getEmbedUrl(youtubeUrl) ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getEmbedUrl(youtubeUrl)}
                        title="YouTube Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                      <p className="text-red-400 text-center px-4">
                        Invalid YouTube URL format. Preview not available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? t('common.saving') : t('common.save')}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </form>
          )}

          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Inspirational Quotes</h2>
                <button
                  onClick={() => setShowQuoteForm(!showQuoteForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Quote
                </button>
              </div>

              {showQuoteForm && (
                <form onSubmit={handleAddQuote} className="bg-white/5 rounded-xl p-6 border border-teal-500/20 space-y-4">
                  <div>
                    <label className="block text-teal-300 mb-2">Quote Text</label>
                    <textarea
                      value={newQuote.text}
                      onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-teal-300 mb-2">Author</label>
                    <input
                      type="text"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-teal-300 mb-2">Language</label>
                    <select
                      value={newQuote.language}
                      onChange={(e) => setNewQuote({ ...newQuote, language: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-gray-800">
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newQuote.text && newQuote.author && (
                    <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                      <p className="text-teal-300 text-sm mb-3 font-semibold">Live Preview</p>
                      <div className="bg-gradient-to-br from-teal-900/50 to-blue-900/50 rounded-lg p-6 border border-teal-500/30">
                        <p className="text-white text-lg italic mb-2">"{newQuote.text}"</p>
                        <p className="text-teal-400">- {newQuote.author}</p>
                        <div className="mt-3">
                          <span className="text-sm text-teal-300 bg-teal-900/30 px-3 py-1 rounded-full">
                            {languages.find((l) => l.code === newQuote.language)?.name || newQuote.language}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Quote'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQuoteForm(false);
                        setNewQuote({ text: '', author: '', language: 'en' });
                      }}
                      className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`bg-white/5 rounded-xl p-6 border transition-all ${
                      quote.is_active ? 'border-green-500/30' : 'border-gray-500/30 opacity-60'
                    }`}
                  >
                    {editingQuote?.id === quote.id ? (
                      <form onSubmit={handleUpdateQuote} className="space-y-4">
                        <textarea
                          value={editingQuote.text}
                          onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          rows={3}
                        />
                        <input
                          type="text"
                          value={editingQuote.author}
                          onChange={(e) => setEditingQuote({ ...editingQuote, author: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                        />
                        <select
                          value={editingQuote.language}
                          onChange={(e) => setEditingQuote({ ...editingQuote, language: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                        >
                          {languages.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-gray-800">
                              {lang.name}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingQuote(null)}
                            className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-white text-lg italic mb-2">"{quote.text}"</p>
                        <p className="text-teal-400 mb-4">- {quote.author}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-teal-300 bg-teal-900/30 px-3 py-1 rounded-full">
                            {languages.find((l) => l.code === quote.language)?.name || quote.language}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            quote.is_active
                              ? 'text-green-300 bg-green-900/30'
                              : 'text-gray-400 bg-gray-900/30'
                          }`}>
                            {quote.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingQuote(quote)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleQuoteActive(quote)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              quote.is_active
                                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {quote.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}

          {activeTab === 'help' && (
            <form onSubmit={handleSaveHelpSettings} className="space-y-6">
              <div>
                <label className="block text-teal-300 mb-2 text-lg font-semibold flex items-center gap-2">
                  <Youtube size={20} />
                  Help Video YouTube URL
                </label>
                <input
                  type="text"
                  value={helpYoutubeUrl}
                  onChange={(e) => setHelpYoutubeUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Enter YouTube video URL for help"
                />
                <p className="text-teal-400 text-sm mt-2">
                  This video will be shown when users click the "Project Help" button
                </p>
              </div>

              {helpYoutubeUrl && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <p className="text-teal-300 text-sm mb-3 font-semibold">Video Preview</p>
                  {getEmbedUrl(helpYoutubeUrl) ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getEmbedUrl(helpYoutubeUrl)}
                        title="Help Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                      <p className="text-red-400 text-center px-4">
                        Invalid YouTube URL format. Preview not available.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-teal-300 mb-2 text-lg font-semibold flex items-center gap-2">
                  <Upload size={20} />
                  Help Image URL
                </label>
                <input
                  type="text"
                  value={helpImageUrl}
                  onChange={(e) => setHelpImageUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                />
                <p className="text-teal-400 text-sm mt-2">
                  This image will be displayed in the help modal along with the video
                </p>
              </div>

              {helpImageUrl && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <p className="text-teal-300 text-sm mb-3 font-semibold">Image Preview</p>
                  <img
                    src={helpImageUrl}
                    alt="Help Preview"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.className = 'bg-red-500/10 border border-red-500/30 rounded-lg p-8 flex items-center justify-center';
                      errorDiv.innerHTML = '<p class="text-red-400 text-center">Failed to load image. Please check the URL.</p>';
                      target.parentElement?.appendChild(errorDiv);
                    }}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Help Settings'}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </form>
          )}

          {activeTab === 'theme' && (
            <form onSubmit={handleSaveTheme} className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Theme Color Settings</h2>
              <p className="text-teal-300 mb-6">
                Customize the color theme of your application. Changes will update instantly across all pages.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-teal-300 mb-2">Primary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={themeColors.primaryColor}
                      onChange={(e) => setThemeColors({ ...themeColors, primaryColor: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-teal-500/30"
                    />
                    <input
                      type="text"
                      value={themeColors.primaryColor}
                      onChange={(e) => setThemeColors({ ...themeColors, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-teal-300 mb-2">Secondary Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={themeColors.secondaryColor}
                      onChange={(e) => setThemeColors({ ...themeColors, secondaryColor: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-teal-500/30"
                    />
                    <input
                      type="text"
                      value={themeColors.secondaryColor}
                      onChange={(e) => setThemeColors({ ...themeColors, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-teal-300 mb-2">Accent Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={themeColors.accentColor}
                      onChange={(e) => setThemeColors({ ...themeColors, accentColor: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-teal-500/30"
                    />
                    <input
                      type="text"
                      value={themeColors.accentColor}
                      onChange={(e) => setThemeColors({ ...themeColors, accentColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-teal-300 mb-2">Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={themeColors.backgroundColor}
                      onChange={(e) => setThemeColors({ ...themeColors, backgroundColor: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border-2 border-teal-500/30"
                    />
                    <input
                      type="text"
                      value={themeColors.backgroundColor}
                      onChange={(e) => setThemeColors({ ...themeColors, backgroundColor: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-teal-500/20">
                <p className="text-teal-300 text-sm mb-4 font-semibold">Theme Preview</p>
                <div className="grid grid-cols-4 gap-4">
                  <div
                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: themeColors.primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: themeColors.secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div
                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: themeColors.accentColor }}
                  >
                    Accent
                  </div>
                  <div
                    className="h-20 rounded-lg flex items-center justify-center text-white font-semibold border border-teal-500/30"
                    style={{ backgroundColor: themeColors.backgroundColor }}
                  >
                    Background
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Theme'}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </form>
          )}

          {activeTab === 'hero' && (
            <form onSubmit={handleHeroImageUpload} className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Hero Banner Image</h2>
              <p className="text-teal-300 mb-6">
                Upload a new hero banner image. Recommended size: 1920x600px or larger. Supports JPG, PNG, WebP.
              </p>

              <div>
                <label className="block text-teal-300 mb-2 text-lg font-semibold flex items-center gap-2">
                  <Upload size={20} />
                  Upload Hero Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white hover:file:bg-teal-600 file:cursor-pointer"
                />
              </div>

              {heroPreviewUrl && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <p className="text-teal-300 text-sm mb-3 font-semibold">New Image Preview</p>
                  <img
                    src={heroPreviewUrl}
                    alt="Hero Preview"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}

              {heroImageUrl && !heroPreviewUrl && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <p className="text-teal-300 text-sm mb-3 font-semibold">Current Hero Image</p>
                  <img
                    src={heroImageUrl}
                    alt="Current Hero"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || !heroImageFile}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading...' : 'Upload & Save'}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </form>
          )}

          {activeTab === 'announcement' && (
            <form onSubmit={handleAnnouncementSave} className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Announcement Bar</h2>
              <p className="text-teal-300 mb-6">
                Create a scrolling announcement bar that appears at the top of all pages. Perfect for important updates and messages.
              </p>

              <div>
                <label className="block text-teal-300 mb-2">Announcement Message</label>
                <textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                  rows={3}
                  placeholder="Enter your announcement message here..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="announcement-active"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-5 h-5 rounded border-teal-500/30 bg-white/5 checked:bg-teal-500 cursor-pointer"
                />
                <label htmlFor="announcement-active" className="text-teal-300 cursor-pointer">
                  Show announcement bar to all users
                </label>
              </div>

              {announcementMessage && (
                <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-teal-300 text-sm font-semibold">Preview</p>
                    {!announcementActive && (
                      <span className="text-yellow-400 text-xs bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
                        Not Active - Toggle "Show announcement bar" to enable
                      </span>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border border-yellow-500/30 rounded-lg overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap py-3 text-yellow-100 font-medium text-lg">
                      <span className="inline-block px-4">{announcementMessage}</span>
                      <span className="inline-block px-4">{announcementMessage}</span>
                      <span className="inline-block px-4">{announcementMessage}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Announcement'}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </form>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Theme Presets</h2>
              <p className="text-teal-300 mb-6">
                Choose from professionally designed color themes. Click "Apply" to instantly update your website's color scheme.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {themePresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-white/5 rounded-xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">{preset.name}</h3>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: preset.primary_color }}
                        title="Primary"
                      >
                        Primary
                      </div>
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: preset.secondary_color }}
                        title="Secondary"
                      >
                        Second
                      </div>
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                        style={{ backgroundColor: preset.accent_color }}
                        title="Accent"
                      >
                        Accent
                      </div>
                      <div
                        className="h-16 rounded-lg flex items-center justify-center text-white text-xs font-semibold border border-teal-500/30"
                        style={{ backgroundColor: preset.background_color }}
                        title="Background"
                      >
                        BG
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset)}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Applying...' : 'Apply Theme'}
                    </button>
                  </div>
                ))}
              </div>

              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Display Settings</h2>
              <p className="text-teal-300 mb-6">
                Control the visibility of various sections on your website. Changes take effect immediately for all users.
              </p>

              <div className="bg-white/5 rounded-xl p-6 border border-teal-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Active Meditators List</h3>
                    <p className="text-teal-300 text-sm">
                      Show or hide the real-time list of active meditators on the dashboard. The globe visualization will remain visible.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowActiveMeditators(!showActiveMeditators)}
                    className={`ml-6 relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                      showActiveMeditators ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                        showActiveMeditators ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    />
                    <span className="absolute left-3 text-white text-xs font-bold">
                      {showActiveMeditators ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </span>
                  </button>
                </div>

                <div className="pt-4 border-t border-teal-500/20">
                  <div className="flex items-center gap-3 text-sm text-teal-300">
                    <div className={`w-3 h-3 rounded-full ${showActiveMeditators ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">
                      Active Meditators List is currently {showActiveMeditators ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-teal-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Video className="w-6 h-6 text-teal-400" />
                      Meditation Room Button
                    </h3>
                    <p className="text-teal-300 text-sm">
                      Show or hide the "Meditation Room" button in the navigation menu. Users won't see the button when hidden.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMeditationRoom(!showMeditationRoom)}
                    className={`ml-6 relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                      showMeditationRoom ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                        showMeditationRoom ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    />
                    <span className="absolute left-3 text-white text-xs font-bold">
                      {showMeditationRoom ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </span>
                  </button>
                </div>

                <div className="pt-4 border-t border-teal-500/20">
                  <div className="flex items-center gap-3 text-sm text-teal-300">
                    <div className={`w-3 h-3 rounded-full ${showMeditationRoom ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">
                      Meditation Room Button is currently {showMeditationRoom ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-indigo-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <GlobeIcon className="w-6 h-6 text-indigo-400" />
                      Globe Meditation Mode
                    </h3>
                    <p className="text-indigo-300 text-sm">
                      Switch between Day (bright Earth) or Night (dark glowing Earth) view of the 3D globe for all users.
                    </p>
                  </div>
                  <button
                    onClick={() => setGlobeDayNightMode(globeDayNightMode === 'night' ? 'day' : 'night')}
                    className={`ml-6 relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                      globeDayNightMode === 'day' ? 'bg-yellow-400' : 'bg-indigo-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                        globeDayNightMode === 'day' ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    />
                    <span className="absolute left-3 text-white text-xs font-bold">
                      {globeDayNightMode === 'day' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </span>
                  </button>
                </div>

                <div className="pt-4 border-t border-indigo-500/20">
                  <div className="flex items-center gap-3 text-sm text-indigo-300">
                    <div className={`w-3 h-3 rounded-full ${globeDayNightMode === 'day' ? 'bg-yellow-400' : 'bg-indigo-400'}`}></div>
                    <span className="font-semibold">
                      Globe is currently in {globeDayNightMode === 'day' ? '🌞 DAY' : '🌙 NIGHT'} mode
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      Top 100 Meditators List
                    </h3>
                    <p className="text-yellow-300 text-sm">
                      Show or hide the Top 100 Meditators List section with daily, weekly, and monthly rankings on the dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className={`ml-6 relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                      showLeaderboard ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${
                        showLeaderboard ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    />
                    <span className="absolute left-3 text-white text-xs font-bold">
                      {showLeaderboard ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </span>
                  </button>
                </div>

                <div className="pt-4 border-t border-yellow-500/20">
                  <div className="flex items-center gap-3 text-sm text-yellow-300">
                    <div className={`w-3 h-3 rounded-full ${showLeaderboard ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="font-semibold">
                      Leaderboard is currently {showLeaderboard ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveDisplaySettings}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Display Settings'}
                </button>

                <a
                  href="/"
                  className="flex-1 flex items-center justify-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
                >
                  {t('common.backToDashboard')}
                </a>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationManager />
          )}

          {activeTab === 'room' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Meditation Room Videos</h2>
                <button
                  onClick={() => setShowVideoForm(!showVideoForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Video
                </button>
              </div>

              <p className="text-teal-300">
                Manage YouTube videos for the meditation room. Users can select and start meditation with any of these videos.
              </p>

              {showVideoForm && (
                <form onSubmit={handleAddVideo} className="bg-white/5 rounded-xl p-6 border border-teal-500/20 space-y-4">
                  <div>
                    <label className="block text-teal-300 mb-2">Video Title</label>
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Enter a descriptive title for the video"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-teal-300 mb-2">YouTube URL</label>
                    <input
                      type="text"
                      value={newVideo.youtube_url}
                      onChange={(e) => setNewVideo({ ...newVideo, youtube_url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>

                  {newVideo.youtube_url && (
                    <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                      <p className="text-teal-300 text-sm mb-3 font-semibold">Preview</p>
                      {getEmbedUrl(newVideo.youtube_url) ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(newVideo.youtube_url)}
                            title="Video Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                          <p className="text-red-400 text-center px-4">
                            Invalid YouTube URL format. Preview not available.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Video'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVideoForm(false);
                        setNewVideo({ title: '', youtube_url: '' });
                      }}
                      className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {roomVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`bg-white/5 rounded-xl p-6 border transition-all ${
                      video.is_active ? 'border-green-500/30' : 'border-gray-500/30 opacity-60'
                    }`}
                  >
                    {editingVideo?.id === video.id ? (
                      <form onSubmit={handleUpdateVideo} className="space-y-4">
                        <input
                          type="text"
                          value={editingVideo.title}
                          onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          placeholder="Video Title"
                        />
                        <input
                          type="text"
                          value={editingVideo.youtube_url}
                          onChange={(e) => setEditingVideo({ ...editingVideo, youtube_url: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          placeholder="YouTube URL"
                        />
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingVideo(null)}
                            className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                            <p className="text-teal-400 text-sm break-all">{video.youtube_url}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleMoveVideo(video.id, 'up')}
                              disabled={index === 0}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveVideo(video.id, 'down')}
                              disabled={index === roomVideos.length - 1}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-teal-300 bg-teal-900/30 px-3 py-1 rounded-full">
                            Order: {index + 1}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            video.is_active
                              ? 'text-green-300 bg-green-900/30'
                              : 'text-gray-400 bg-gray-900/30'
                          }`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingVideo(video)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleVideoActive(video)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              video.is_active
                                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {video.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {roomVideos.length === 0 && !showVideoForm && (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-teal-500/20">
                  <Video className="w-16 h-16 text-teal-400 mx-auto mb-4 opacity-50" />
                  <p className="text-teal-300 text-lg">No videos added yet</p>
                  <p className="text-teal-400 text-sm mt-2">Click "Add Video" to create your first meditation room video</p>
                </div>
              )}

              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}

          {activeTab === 'goodwishes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  Good Wishes Manager
                </h2>
                <button
                  onClick={() => setGwShowForm(!gwShowForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Video
                </button>
              </div>

              <p className="text-teal-300">
                Manage YouTube videos for the Good Wishes page. Only active videos are shown to users.
              </p>

              {gwShowForm && (
                <form onSubmit={handleGwAddVideo} className="bg-white/5 rounded-xl p-6 border border-teal-500/20 space-y-4">
                  <div>
                    <label className="block text-teal-300 mb-2">Video Title</label>
                    <input
                      type="text"
                      value={gwNewVideo.title}
                      onChange={(e) => setGwNewVideo({ ...gwNewVideo, title: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Enter a descriptive title for the video"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-teal-300 mb-2">YouTube URL</label>
                    <input
                      type="text"
                      value={gwNewVideo.youtube_url}
                      onChange={(e) => setGwNewVideo({ ...gwNewVideo, youtube_url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>

                  {gwNewVideo.youtube_url && (
                    <div className="bg-white/5 rounded-xl p-4 border border-teal-500/20">
                      <p className="text-teal-300 text-sm mb-3 font-semibold">Preview</p>
                      {getEmbedUrl(gwNewVideo.youtube_url) ? (
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(gwNewVideo.youtube_url)}
                            title="Video Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                          <p className="text-red-400 text-center px-4">
                            Invalid YouTube URL format. Preview not available.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Video'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGwShowForm(false);
                        setGwNewVideo({ title: '', youtube_url: '' });
                      }}
                      className="flex-1 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {gwVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`bg-white/5 rounded-xl p-6 border transition-all ${
                      video.is_active ? 'border-green-500/30' : 'border-gray-500/30 opacity-60'
                    }`}
                  >
                    {gwEditingVideo?.id === video.id ? (
                      <form onSubmit={handleGwUpdateVideo} className="space-y-4">
                        <input
                          type="text"
                          value={gwEditingVideo.title}
                          onChange={(e) => setGwEditingVideo({ ...gwEditingVideo, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          placeholder="Video Title"
                        />
                        <input
                          type="text"
                          value={gwEditingVideo.youtube_url}
                          onChange={(e) => setGwEditingVideo({ ...gwEditingVideo, youtube_url: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white focus:outline-none focus:border-teal-500"
                          placeholder="YouTube URL"
                        />
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setGwEditingVideo(null)}
                            className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
                            <p className="text-teal-400 text-sm break-all">{video.youtube_url}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleGwMoveVideo(video.id, 'up')}
                              disabled={index === 0}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleGwMoveVideo(video.id, 'down')}
                              disabled={index === gwVideos.length - 1}
                              className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-teal-300 bg-teal-900/30 px-3 py-1 rounded-full">
                            Order: {index + 1}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            video.is_active
                              ? 'text-green-300 bg-green-900/30'
                              : 'text-gray-400 bg-gray-900/30'
                          }`}>
                            {video.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setGwEditingVideo(video)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => toggleGwActive(video)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              video.is_active
                                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            }`}
                          >
                            {video.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleGwDeleteVideo(video.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {gwVideos.length === 0 && !gwShowForm && (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-teal-500/20">
                  <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4 opacity-50" />
                  <p className="text-teal-300 text-lg">No videos added yet</p>
                  <p className="text-teal-400 text-sm mt-2">Click "Add Video" to create your first Good Wishes video</p>
                </div>
              )}

              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <LeaderboardManagement />
              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}

          {activeTab === 'duplicates' && (
            <div className="space-y-6">
              <DuplicateUserManagement />
              <a
                href="/"
                className="block text-center py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-teal-500/30"
              >
                {t('common.backToDashboard')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

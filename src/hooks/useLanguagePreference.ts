import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const SESSION_ID_KEY = 'meditation_session_id';

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

export const useLanguagePreference = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadLanguagePreference = async () => {
      const sessionId = getOrCreateSessionId();

      const { data } = await supabase
        .from('user_preferences')
        .select('language')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (data && data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
    };

    loadLanguagePreference();
  }, [i18n]);

  useEffect(() => {
    const saveLanguagePreference = async () => {
      const sessionId = getOrCreateSessionId();

      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_preferences')
          .update({
            language: i18n.language,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            session_id: sessionId,
            language: i18n.language,
          });
      }
    };

    saveLanguagePreference();
  }, [i18n.language]);
};

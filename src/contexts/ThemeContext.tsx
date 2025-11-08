import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateTheme: (colors: ThemeColors) => Promise<void>;
}

const defaultColors: ThemeColors = {
  primaryColor: '#14b8a6',
  secondaryColor: '#0891b2',
  accentColor: '#06b6d4',
  backgroundColor: '#0f172a',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('[ThemeContext] Initializing theme provider');
    applyThemeColors(defaultColors);
    setIsInitialized(true);

    fetchThemeSettings();

    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'theme_settings' },
        () => {
          fetchThemeSettings();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      applyThemeColors(colors);
    }
  }, [colors, isInitialized]);

  const fetchThemeSettings = async () => {
    try {
      console.log('[ThemeContext] Fetching theme settings from Supabase');
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.warn('[ThemeContext] Failed to fetch theme settings, using defaults:', error);
        return;
      }

      if (data) {
        console.log('[ThemeContext] Theme settings loaded successfully');
        setColors({
          primaryColor: data.primary_color || defaultColors.primaryColor,
          secondaryColor: data.secondary_color || defaultColors.secondaryColor,
          accentColor: data.accent_color || defaultColors.accentColor,
          backgroundColor: data.background_color || defaultColors.backgroundColor,
        });
      } else {
        console.log('[ThemeContext] No theme settings found, using defaults');
      }
    } catch (error) {
      console.warn('[ThemeContext] Error fetching theme settings:', error);
    }
  };

  const applyThemeColors = (themeColors: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeColors.primaryColor);
    root.style.setProperty('--color-secondary', themeColors.secondaryColor);
    root.style.setProperty('--color-accent', themeColors.accentColor);
    root.style.setProperty('--color-background', themeColors.backgroundColor);

    // Apply background gradient to main containers
    setTimeout(() => {
      const mainContainers = document.querySelectorAll('.min-h-screen');
      mainContainers.forEach((container) => {
        (container as HTMLElement).style.background = `linear-gradient(to bottom right, ${themeColors.primaryColor}, ${themeColors.secondaryColor}, ${themeColors.accentColor})`;
      });
    }, 100);
  };

  const updateTheme = async (newColors: ThemeColors) => {
    const { data: existing } = await supabase
      .from('theme_settings')
      .select('id')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('theme_settings')
        .update({
          primary_color: newColors.primaryColor,
          secondary_color: newColors.secondaryColor,
          accent_color: newColors.accentColor,
          background_color: newColors.backgroundColor,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('theme_settings')
        .insert({
          primary_color: newColors.primaryColor,
          secondary_color: newColors.secondaryColor,
          accent_color: newColors.accentColor,
          background_color: newColors.backgroundColor,
        });
    }

    setColors(newColors);
  };

  return (
    <ThemeContext.Provider value={{ colors, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

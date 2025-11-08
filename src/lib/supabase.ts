import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helpers to safely gate network calls and provide a central switch
export let SUPABASE_DISABLED_FOR_SESSION = false;

export function isSupabaseEnabled(): boolean {
  return !SUPABASE_DISABLED_FOR_SESSION && !!supabaseUrl && !!supabaseAnonKey;
}

export function disableSupabase(reason?: string) {
  SUPABASE_DISABLED_FOR_SESSION = true;
  const msg = reason ? `Supabase disabled: ${reason}` : 'Supabase disabled for this session';
  // eslint-disable-next-line no-console
  console.warn('[Supabase]', msg);
}

// If env vars are present, create the client; otherwise export a light stub
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )
  : ({} as any);

// Utility wrapper to run a Supabase async call and automatically disable on network failure
export async function trySupabase<T>(fn: () => Promise<T>): Promise<T | null> {
  if (!isSupabaseEnabled()) return null;
  try {
    return await fn();
  } catch (e: any) {
    const message = (e?.message ?? String(e)).toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('abort')) {
      disableSupabase('Network error detected');
    }
    // eslint-disable-next-line no-console
    console.error('[Supabase] call failed:', e);
    return null;
  }
}

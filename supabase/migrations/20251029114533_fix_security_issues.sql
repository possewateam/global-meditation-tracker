/*
  # Fix Security Issues

  ## Changes
  
  1. **Indexes**
     - Add index on `registration_settings.updated_by` to optimize foreign key queries
     - Remove unused index `idx_room_sessions_user_id` on `room_sessions.user_id`
  
  2. **Views Security**
     - Recreate `lifetime_meditation_stats` view without SECURITY DEFINER
     - Recreate `today_meditation_stats` view without SECURITY DEFINER
  
  3. **Function Security**
     - Fix `calculate_date_total` functions to have immutable search_path
  
  4. **Extensions**
     - Move `pg_net` extension from public schema to extensions schema
  
  5. **Auth Security**
     - Note: Leaked password protection must be enabled via Supabase Dashboard
       (Auth > Providers > Email > "Enable Leaked Password Protection")
*/

-- 1. Add index for foreign key on registration_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_registration_settings_updated_by 
ON registration_settings(updated_by);

-- 2. Remove unused index on room_sessions
DROP INDEX IF EXISTS idx_room_sessions_user_id;

-- 3. Fix SECURITY DEFINER views
-- Drop and recreate lifetime_meditation_stats without SECURITY DEFINER
DROP VIEW IF EXISTS lifetime_meditation_stats;
CREATE VIEW lifetime_meditation_stats AS
  SELECT COALESCE(sum(total_seconds), 0::numeric) AS total_seconds
  FROM daily_meditation_totals;

-- Drop and recreate today_meditation_stats without SECURITY DEFINER
DROP VIEW IF EXISTS today_meditation_stats;
CREATE VIEW today_meditation_stats AS
  SELECT count(*) AS active_sessions,
    get_today_total_with_active() AS total_minutes
  FROM meditation_sessions
  WHERE session_date = CURRENT_DATE 
    AND is_active = true 
    AND last_heartbeat > (now() - interval '15 seconds');

-- 4. Fix calculate_date_total functions with proper search_path
-- Drop existing functions
DROP FUNCTION IF EXISTS calculate_date_total();
DROP FUNCTION IF EXISTS calculate_date_total(date);

-- Recreate trigger function with fixed search_path
CREATE OR REPLACE FUNCTION calculate_date_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.meditation_end IS NOT NULL AND NEW.meditation_start IS NOT NULL THEN
    NEW.meditation_duration := EXTRACT(EPOCH FROM (NEW.meditation_end - NEW.meditation_start))::bigint;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate date calculation function with fixed search_path
CREATE OR REPLACE FUNCTION calculate_date_total(target_date date)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  total numeric;
BEGIN
  SELECT COALESCE(SUM(duration_seconds / 60.0), 0)
  INTO total
  FROM meditation_sessions
  WHERE session_date = target_date
    AND end_time IS NOT NULL
    AND duration_seconds IS NOT NULL;

  RETURN ROUND(total, 2);
END;
$$;

-- 5. Move pg_net extension to extensions schema
-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net extension
DO $$
BEGIN
  -- Check if pg_net exists in public schema
  IF EXISTS (
    SELECT 1 
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'pg_net' AND n.nspname = 'public'
  ) THEN
    -- Drop and recreate in extensions schema
    DROP EXTENSION IF EXISTS pg_net;
    CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  END IF;
END $$;

-- Grant necessary permissions on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

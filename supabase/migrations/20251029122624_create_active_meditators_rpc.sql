/*
  # Create Active Meditators RPC Function

  ## Purpose
  Create an RLS-safe RPC function to fetch active meditators with their location data
  for display in the sidebar list and on the globe visualization.

  ## Changes
  1. Create `get_active_meditators(max_hours)` function:
     - Returns active sessions with geographic coordinates
     - Filters out sessions without valid coordinates
     - Uses SECURITY DEFINER to bypass RLS
     - Includes user profile data for city/country
     - Handles active sessions (is_active = true)

  2. Add geospatial indexes for performance:
     - Index on (is_active, start_time) for active session queries
     - Index on (latitude, longitude) for geospatial lookups

  3. Grant execution permissions to anon and authenticated roles

  ## Benefits
  - Single query for all active meditators (RLS-safe)
  - Real-time compatible with subscriptions
  - Fast queries with proper indexes
  - Filters invalid coordinates automatically
  - Includes user location context
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_active_meditators(int);

-- Create the RPC function
CREATE OR REPLACE FUNCTION public.get_active_meditators(max_hours int DEFAULT 24)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  city text,
  country text,
  lat double precision,
  lon double precision,
  started_at timestamptz,
  bk_centre_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ms.id,
    ms.user_id,
    COALESCE(ms.name, 'Yogi') AS name,
    COALESCE(u.city_town, ms.location) AS city,
    u.country,
    ms.latitude::double precision AS lat,
    ms.longitude::double precision AS lon,
    ms.start_time AS started_at,
    u.bk_centre_name
  FROM public.meditation_sessions ms
  LEFT JOIN public.users u ON ms.user_id = u.id
  WHERE
    ms.is_active = true
    AND ms.start_time IS NOT NULL
    AND COALESCE(ms.latitude, 0) <> 0
    AND COALESCE(ms.longitude, 0) <> 0
    AND (NOW() - ms.start_time) < make_interval(hours => max_hours)
  ORDER BY ms.start_time DESC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_active_meditators(int) TO anon, authenticated;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_active 
  ON public.meditation_sessions (is_active, start_time) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_geo 
  ON public.meditation_sessions (latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

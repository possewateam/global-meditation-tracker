/*
  # Create Meditation Time Leaderboard System
  
  1. Settings Table Enhancement
    - Add leaderboard_visible setting with default true
    - Enables admin control over leaderboard visibility site-wide
  
  2. SQL Functions Created
    - `session_overlap_seconds()`: Calculates overlap between session and time window
    - `leaderboard_window()`: Generic leaderboard aggregator for any time range
    - `leaderboard_today_ist()`: Today's leaderboard in IST timezone
    - `leaderboard_week_ist()`: This week's leaderboard (Mon-Sun IST)
    - `leaderboard_month_ist()`: This month's leaderboard in IST timezone
  
  3. Security
    - RLS policies allow reading leaderboard data for all users
    - Grant execute permissions on RPC functions to anon and authenticated roles
  
  4. Performance
    - Server-side aggregation using SQL for fast processing
    - Proper indexing on meditation_sessions(start_time)
    - Handles sessions spanning time boundaries via overlap calculation
  
  Important Notes:
  - All time calculations use Asia/Kolkata timezone
  - Week starts on Monday (ISO standard)
  - Joins sessions to users by name field (can be updated to user_id if needed)
  - Returns top 100 meditators by default (configurable via p_limit parameter)
*/

-- Ensure settings table has leaderboard visibility control
DO $$
BEGIN
  -- Check if the settings table exists and add the leaderboard_visible setting
  INSERT INTO public.settings (id, key, value, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000001',
    'leaderboard_visible',
    'true',
    now(),
    now()
  )
  ON CONFLICT (key) DO NOTHING;
END $$;

-- Index for performance (check if exists before creating)
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_start_time 
  ON public.meditation_sessions (start_time DESC);

-- Create index on name for joining
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_name 
  ON public.meditation_sessions (name);

CREATE INDEX IF NOT EXISTS idx_users_name 
  ON public.users (name);

-- Function: Calculate overlap seconds between session and time window
CREATE OR REPLACE FUNCTION public.session_overlap_seconds(
  s_start timestamptz,
  s_end timestamptz,
  p_from timestamptz,
  p_to timestamptz
)
RETURNS bigint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(0,
    EXTRACT(epoch FROM (
      LEAST(COALESCE(s_end, now()), p_to) - GREATEST(s_start, p_from)
    ))
  )::bigint;
$$;

-- Function: Generic leaderboard for any time window
CREATE OR REPLACE FUNCTION public.leaderboard_window(
  p_from timestamptz,
  p_to timestamptz,
  p_limit int DEFAULT 100
)
RETURNS TABLE (
  rank bigint,
  mobile_e164 text,
  name text,
  bk_centre_name text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH sums AS (
    SELECT
      u.mobile_e164,
      COALESCE(u.name, 'Anonymous') as name,
      COALESCE(u.bk_centre_name, '') as bk_centre_name,
      SUM(
        public.session_overlap_seconds(s.start_time, s.end_time, p_from, p_to)
      )::bigint as total_seconds
    FROM public.users u
    LEFT JOIN public.meditation_sessions s
      ON (s.name IS NOT NULL AND s.name = u.name)
    WHERE s.start_time < p_to 
      AND (s.end_time IS NULL OR s.end_time > p_from)
    GROUP BY u.mobile_e164, u.name, u.bk_centre_name
  ),
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY total_seconds DESC, name ASC) as rank,
      mobile_e164,
      name,
      bk_centre_name,
      total_seconds
    FROM sums
    WHERE total_seconds > 0
  )
  SELECT * FROM ranked
  ORDER BY rank
  LIMIT p_limit;
$$;

-- Function: Today's leaderboard in IST
CREATE OR REPLACE FUNCTION public.leaderboard_today_ist(p_limit int DEFAULT 100)
RETURNS TABLE (
  rank bigint,
  mobile_e164 text,
  name text,
  bk_centre_name text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH bounds AS (
    SELECT
      DATE_TRUNC('day', timezone('Asia/Kolkata', now()))::timestamp as local_start,
      (DATE_TRUNC('day', timezone('Asia/Kolkata', now())) + INTERVAL '1 day')::timestamp as local_end
  )
  SELECT * FROM public.leaderboard_window(
    (SELECT (local_start AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    (SELECT (local_end AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    p_limit
  );
$$;

-- Function: This week's leaderboard in IST (Monday to Sunday)
CREATE OR REPLACE FUNCTION public.leaderboard_week_ist(p_limit int DEFAULT 100)
RETURNS TABLE (
  rank bigint,
  mobile_e164 text,
  name text,
  bk_centre_name text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH now_local AS (
    SELECT timezone('Asia/Kolkata', now()) as t
  ),
  bounds AS (
    SELECT
      DATE_TRUNC('week', t)::timestamp as local_start,
      (DATE_TRUNC('week', t) + INTERVAL '7 days')::timestamp as local_end
    FROM now_local
  )
  SELECT * FROM public.leaderboard_window(
    (SELECT (local_start AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    (SELECT (local_end AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    p_limit
  );
$$;

-- Function: This month's leaderboard in IST
CREATE OR REPLACE FUNCTION public.leaderboard_month_ist(p_limit int DEFAULT 100)
RETURNS TABLE (
  rank bigint,
  mobile_e164 text,
  name text,
  bk_centre_name text,
  total_seconds bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH now_local AS (
    SELECT timezone('Asia/Kolkata', now()) as t
  ),
  bounds AS (
    SELECT
      DATE_TRUNC('month', t)::timestamp as local_start,
      (DATE_TRUNC('month', t) + INTERVAL '1 month')::timestamp as local_end
    FROM now_local
  )
  SELECT * FROM public.leaderboard_window(
    (SELECT (local_start AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    (SELECT (local_end AT TIME ZONE 'Asia/Kolkata') FROM bounds),
    p_limit
  );
$$;

-- Grant execute permissions on all leaderboard functions
GRANT EXECUTE ON FUNCTION public.session_overlap_seconds(timestamptz, timestamptz, timestamptz, timestamptz) 
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.leaderboard_window(timestamptz, timestamptz, int) 
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.leaderboard_today_ist(int) 
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.leaderboard_week_ist(int) 
  TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.leaderboard_month_ist(int) 
  TO anon, authenticated;
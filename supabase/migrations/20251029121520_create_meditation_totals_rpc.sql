/*
  # Create Meditation Totals RPC Function

  ## Purpose
  Create a single RPC function that returns both all-time and today's collective
  meditation totals in minutes, bypassing RLS restrictions using SECURITY DEFINER.

  ## Changes
  1. Create `get_meditation_totals(tz)` function:
     - Returns both total_minutes (all-time) and today_minutes
     - Handles timezone-aware "today" calculation
     - Uses stored duration_seconds or computes from timestamps
     - Runs as SECURITY DEFINER to bypass RLS
     - Has immutable search_path for security

  2. Grant execution permissions to anon and authenticated roles

  ## Benefits
  - Single query for both totals (reduces latency)
  - Works with RLS enabled (SECURITY DEFINER)
  - Timezone-aware for accurate "today" calculation
  - No client-side aggregation needed
  - Handles both completed and active sessions
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_meditation_totals(text);

-- Create the RPC function
CREATE OR REPLACE FUNCTION public.get_meditation_totals(tz text DEFAULT 'Asia/Kolkata')
RETURNS TABLE(total_minutes bigint, today_minutes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT
      (start_time AT TIME ZONE 'UTC' AT TIME ZONE tz) AS started_local,
      COALESCE(
        duration_seconds,
        EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))
      )::bigint AS dur_seconds
    FROM public.meditation_sessions
    WHERE start_time IS NOT NULL
  )
  SELECT
    COALESCE((SUM(dur_seconds) / 60)::bigint, 0) AS total_minutes,
    COALESCE((SUM(
       CASE WHEN DATE(started_local) = DATE(TIMEZONE(tz, NOW()))
            THEN dur_seconds ELSE 0 END
    ) / 60)::bigint, 0) AS today_minutes
  FROM normalized;
$$;

-- Grant execute permissions to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_meditation_totals(text) TO anon, authenticated;

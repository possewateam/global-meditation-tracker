/*
  # Fix Today's Total Timezone Calculation

  ## Problem
  The `get_meditation_totals` function is correctly calculating "today" based on 
  timezone, but the timezone conversion is not working as expected because 
  `AT TIME ZONE` produces timestamp without timezone when converting from timestamptz.

  ## Solution
  Use proper timezone conversion that maintains the local date correctly:
  - Use `(start_time AT TIME ZONE tz)::date` for date extraction
  - Compare with `(NOW() AT TIME ZONE tz)::date` for today's date
  - This ensures accurate "today" calculation regardless of timezone

  ## Changes
  1. Replace the `get_meditation_totals` function with corrected timezone logic
  2. Maintain backward compatibility (same signature and return type)
*/

-- Drop existing function
DROP FUNCTION IF EXISTS public.get_meditation_totals(text);

-- Create the corrected RPC function
CREATE OR REPLACE FUNCTION public.get_meditation_totals(tz text DEFAULT 'Asia/Kolkata')
RETURNS TABLE(total_minutes bigint, today_minutes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH normalized AS (
    SELECT
      (start_time AT TIME ZONE tz)::date AS session_date,
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
       CASE WHEN session_date = (NOW() AT TIME ZONE tz)::date
            THEN dur_seconds ELSE 0 END
    ) / 60)::bigint, 0) AS today_minutes
  FROM normalized;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_meditation_totals(text) TO anon, authenticated;

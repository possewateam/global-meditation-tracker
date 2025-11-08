/*
  # Update Leaderboard Functions to Hide Duplicate Users

  ## Summary
  Updates the leaderboard_window() function to filter out users marked as duplicates
  and aggregate their meditation sessions under their primary account.

  ## Changes Made

  ### 1. Modified leaderboard_window() Function
    - Filters out users where is_duplicate = true
    - Aggregates meditation sessions from duplicate accounts to primary accounts
    - Uses COALESCE to handle both primary and duplicate user sessions
    - Maintains rank ordering by total meditation time

  ### 2. Behavior
    - Only non-duplicate users appear in leaderboard
    - Meditation time from duplicate accounts is added to primary account total
    - Rank calculation remains unchanged
    - Display shows primary account name, phone, and centre

  ## Important Notes
  - This is a DROP and CREATE operation for the leaderboard_window function
  - All dependent functions (leaderboard_today_ist, leaderboard_week_ist, leaderboard_month_ist)
    automatically use the updated logic
  - No changes to meditation_sessions table - all data preserved
  - Duplicate users become invisible in leaderboard but their data still counts
*/

-- Drop the existing function to recreate with new logic
DROP FUNCTION IF EXISTS public.leaderboard_window(timestamptz, timestamptz, int);

-- Recreate the function with duplicate filtering and aggregation
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
  WITH
  -- Get all non-duplicate users (primary accounts)
  primary_users AS (
    SELECT
      id,
      mobile_e164,
      name,
      bk_centre_name
    FROM public.users
    WHERE is_duplicate = false OR is_duplicate IS NULL
  ),
  -- Get mapping of duplicate users to their primary accounts
  duplicate_mapping AS (
    SELECT
      u.id as duplicate_id,
      u.name as duplicate_name,
      COALESCE(u.primary_user_id, u.id) as effective_primary_id
    FROM public.users u
    WHERE u.is_duplicate = true AND u.primary_user_id IS NOT NULL
  ),
  -- Aggregate meditation sessions
  session_totals AS (
    SELECT
      -- Map sessions to primary user (either directly or through duplicate mapping)
      COALESCE(dm.effective_primary_id, pu.id) as user_id,
      SUM(
        public.session_overlap_seconds(s.start_time, s.end_time, p_from, p_to)
      )::bigint as total_seconds
    FROM public.meditation_sessions s
    -- Try to match session to primary user by name
    LEFT JOIN primary_users pu ON (s.name IS NOT NULL AND s.name = pu.name)
    -- Also try to match session to duplicate user by name, then map to primary
    LEFT JOIN duplicate_mapping dm ON (s.name IS NOT NULL AND s.name = dm.duplicate_name)
    WHERE s.start_time < p_to
      AND (s.end_time IS NULL OR s.end_time > p_from)
      -- Only include sessions that match either primary or duplicate users
      AND (pu.id IS NOT NULL OR dm.duplicate_id IS NOT NULL)
    GROUP BY COALESCE(dm.effective_primary_id, pu.id)
  ),
  -- Join aggregated totals with user details
  user_totals AS (
    SELECT
      pu.mobile_e164,
      COALESCE(pu.name, 'Anonymous') as name,
      COALESCE(pu.bk_centre_name, '') as bk_centre_name,
      COALESCE(st.total_seconds, 0) as total_seconds
    FROM primary_users pu
    LEFT JOIN session_totals st ON st.user_id = pu.id
    WHERE COALESCE(st.total_seconds, 0) > 0
  ),
  -- Rank the results
  ranked AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY total_seconds DESC, name ASC) as rank,
      mobile_e164,
      name,
      bk_centre_name,
      total_seconds
    FROM user_totals
  )
  SELECT * FROM ranked
  ORDER BY rank
  LIMIT p_limit;
$$;

-- Ensure proper grants are maintained
GRANT EXECUTE ON FUNCTION public.leaderboard_window(timestamptz, timestamptz, int)
  TO anon, authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.leaderboard_window IS 'Generates leaderboard for a time window, filtering out duplicate users and aggregating their sessions to primary accounts';

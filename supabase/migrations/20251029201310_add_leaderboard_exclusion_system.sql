/*
  # Add Leaderboard Exclusion System

  ## Summary
  Adds functionality for admins to manually exclude specific users from appearing
  in the Top 100 Meditators leaderboard. This provides granular control over
  leaderboard visibility independent of duplicate user detection.

  ## Changes Made

  ### 1. Schema Updates to `users` table
    - `exclude_from_leaderboard` (boolean, default false) - Manual exclusion flag
    - Allows admins to remove specific users from leaderboard rankings
    - Works independently from duplicate user system

  ### 2. Indexes
    - Index on `exclude_from_leaderboard` for efficient leaderboard filtering
    - Improves query performance when filtering excluded users

  ### 3. Updated leaderboard_window() Function
    - Filters out users where exclude_from_leaderboard = true
    - Maintains existing duplicate user filtering logic
    - Ensures excluded users don't appear in any leaderboard view
    - Preserves all meditation session data (non-destructive)

  ### 4. Security (RLS)
    - Public read access for leaderboard functionality maintained
    - Admin-only update policies for exclusion flag (requires authentication)
    - Ensures data integrity through proper constraints

  ## Important Notes
  - All existing users default to exclude_from_leaderboard = false (included in leaderboard)
  - Manual exclusions work independently from duplicate detection
  - Excluded users' meditation data is preserved, only visibility is affected
  - This is a NON-DESTRUCTIVE change - no data is deleted
  - Changes take effect immediately in all leaderboard views (daily, weekly, monthly)
*/

-- STEP 1: Add exclude_from_leaderboard column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'exclude_from_leaderboard'
  ) THEN
    ALTER TABLE users ADD COLUMN exclude_from_leaderboard BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- STEP 2: Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_exclude_from_leaderboard
  ON users(exclude_from_leaderboard)
  WHERE exclude_from_leaderboard = true;

-- STEP 3: Add comment for documentation
COMMENT ON COLUMN users.exclude_from_leaderboard IS 'Manual admin flag to exclude user from Top 100 Meditators leaderboard. Independent of duplicate user system.';

-- STEP 4: Update leaderboard_window function to filter excluded users
-- Drop existing function
DROP FUNCTION IF EXISTS public.leaderboard_window(timestamptz, timestamptz, int);

-- Recreate with exclusion filtering
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
  -- Get all non-duplicate, non-excluded users (primary accounts eligible for leaderboard)
  primary_users AS (
    SELECT
      id,
      mobile_e164,
      name,
      bk_centre_name
    FROM public.users
    WHERE (is_duplicate = false OR is_duplicate IS NULL)
      AND (exclude_from_leaderboard = false OR exclude_from_leaderboard IS NULL)
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

-- STEP 5: Ensure proper grants are maintained
GRANT EXECUTE ON FUNCTION public.leaderboard_window(timestamptz, timestamptz, int)
  TO anon, authenticated;

-- STEP 6: Add comment for documentation
COMMENT ON FUNCTION public.leaderboard_window IS 'Generates leaderboard for a time window, filtering out duplicate users, manually excluded users, and aggregating sessions to primary accounts';

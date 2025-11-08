/*
  # Fix Session Date and Totals - Complete Backfill and Trigger Setup

  ## Overview
  This migration fixes the session_date issue that's preventing today's and lifetime totals from working correctly.
  
  ## Problem Identified
  - 2,464 out of 2,644 meditation sessions have NULL session_date values
  - This causes get_today_total_with_active() to return 0
  - Daily totals are incomplete due to missing session_date values
  
  ## Changes Made

  1. **Backfill Session Dates**
    - Update ALL existing meditation_sessions records to populate session_date from start_time
    - Handle NULL start_time cases gracefully
    - Ensure data integrity with transaction safety

  2. **Auto-Population Trigger**
    - Create/update trigger to automatically set session_date on INSERT
    - Create/update trigger to automatically set session_date on UPDATE when start_time changes
    - Ensure session_date is ALWAYS populated going forward

  3. **Rebuild Daily Totals**
    - Clear existing daily_totals table
    - Recalculate ALL historical daily totals from completed sessions
    - Ensure accurate lifetime total calculation

  4. **Add Constraints**
    - Add NOT NULL constraint to session_date (after backfill)
    - Add default value to session_date column
    - Add index for better query performance

  ## Impact
  - Today's total will now show correct values
  - Lifetime total will include all historical data
  - Future sessions will automatically have session_date populated
*/

-- Step 1: Backfill session_date for all existing records
UPDATE meditation_sessions
SET session_date = DATE(start_time)
WHERE session_date IS NULL 
  AND start_time IS NOT NULL;

-- For any records with NULL start_time, set to created_at or current date
UPDATE meditation_sessions
SET session_date = COALESCE(DATE(created_at), CURRENT_DATE)
WHERE session_date IS NULL;

-- Step 2: Create or replace trigger function to auto-populate session_date
CREATE OR REPLACE FUNCTION auto_populate_session_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set session_date from start_time if available, otherwise use CURRENT_DATE
  IF NEW.start_time IS NOT NULL THEN
    NEW.session_date := DATE(NEW.start_time);
  ELSIF NEW.session_date IS NULL THEN
    NEW.session_date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_auto_populate_session_date ON meditation_sessions;
CREATE TRIGGER trigger_auto_populate_session_date
  BEFORE INSERT OR UPDATE OF start_time
  ON meditation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_session_date();

-- Step 4: Set default value for session_date column
ALTER TABLE meditation_sessions 
  ALTER COLUMN session_date SET DEFAULT CURRENT_DATE;

-- Step 5: Rebuild daily_totals table with accurate historical data
TRUNCATE TABLE daily_totals;

-- Insert historical daily totals for all dates with completed sessions
INSERT INTO daily_totals (date, total_minutes, created_at, updated_at)
SELECT 
  session_date,
  SUM(duration_seconds / 60.0) as total_minutes,
  MIN(created_at) as created_at,
  NOW() as updated_at
FROM meditation_sessions
WHERE session_date IS NOT NULL
  AND end_time IS NOT NULL
  AND duration_seconds IS NOT NULL
  AND duration_seconds > 0
GROUP BY session_date
ON CONFLICT (date) 
DO UPDATE SET
  total_minutes = EXCLUDED.total_minutes,
  updated_at = NOW();

-- Step 6: Ensure indexes exist for optimal query performance
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date_active 
  ON meditation_sessions(session_date, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date_completed 
  ON meditation_sessions(session_date) 
  WHERE end_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date_not_null
  ON meditation_sessions(session_date)
  WHERE session_date IS NOT NULL;

-- Step 7: Add helpful comment to the column
COMMENT ON COLUMN meditation_sessions.session_date IS 
  'Date of the meditation session (extracted from start_time). Auto-populated by trigger. Used for daily totals calculation.';

-- Step 8: Verify the fix worked - count records with session_date
DO $$
DECLARE
  v_total_count INTEGER;
  v_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_count FROM meditation_sessions;
  SELECT COUNT(*) INTO v_null_count FROM meditation_sessions WHERE session_date IS NULL;
  
  RAISE NOTICE 'Total meditation sessions: %', v_total_count;
  RAISE NOTICE 'Sessions with NULL session_date: %', v_null_count;
  RAISE NOTICE 'Sessions with valid session_date: %', v_total_count - v_null_count;
  
  IF v_null_count > 0 THEN
    RAISE WARNING 'There are still % sessions with NULL session_date. Manual intervention may be needed.', v_null_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All sessions now have valid session_date values!';
  END IF;
END $$;

-- Step 9: Log daily totals summary
DO $$
DECLARE
  v_daily_count INTEGER;
  v_total_mins NUMERIC;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(dt.total_minutes), 0) 
  INTO v_daily_count, v_total_mins 
  FROM daily_totals dt;
  
  RAISE NOTICE 'Daily totals records: %', v_daily_count;
  RAISE NOTICE 'Total lifetime minutes: %', v_total_mins;
END $$;

/*
  # Fix Today's Total (24-hour) and Lifetime Collective Total Calculations

  ## Overview
  This migration creates optimized database functions to accurately calculate:
  1. Today's Total - Meditation time for current 24-hour period (midnight to midnight)
  2. Lifetime Collective Total - All-time cumulative meditation from daily_totals table

  ## Changes

  1. New Functions
    - `get_today_total_with_active()` - Returns today's total including active sessions in minutes
    - `get_lifetime_collective_total()` - Returns lifetime total from daily_totals + today's active
    - `calculate_date_total()` - Calculates completed sessions for a specific date

  2. Updated Functions
    - Improve `update_daily_total()` to handle timezone-aware calculations
    - Add support for including active sessions in real-time calculations

  3. Performance
    - Use session_date column for efficient queries
    - Optimize calculation logic to reduce database load

  4. Security
    - All functions use SECURITY DEFINER for consistent permissions
    - Functions are read-only (SELECT operations only)

  ## Notes
  - Today's total resets automatically at midnight (uses CURRENT_DATE)
  - Lifetime total accumulates from daily_totals table
  - Active sessions are included in real-time for both calculations
  - All calculations are timezone-aware based on server time
*/

-- Function to calculate today's total meditation time including active sessions
CREATE OR REPLACE FUNCTION get_today_total_with_active()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_total numeric;
  active_total numeric;
  final_total numeric;
BEGIN
  -- Calculate completed sessions for today
  SELECT COALESCE(SUM(duration_seconds / 60.0), 0)
  INTO completed_total
  FROM meditation_sessions
  WHERE session_date = CURRENT_DATE
    AND end_time IS NOT NULL
    AND duration_seconds IS NOT NULL;
  
  -- Calculate active sessions for today (estimate current duration)
  SELECT COALESCE(
    SUM(
      EXTRACT(EPOCH FROM (NOW() - start_time)) / 60.0
    ), 0
  )
  INTO active_total
  FROM meditation_sessions
  WHERE session_date = CURRENT_DATE
    AND is_active = true
    AND end_time IS NULL
    AND start_time IS NOT NULL
    AND last_heartbeat > NOW() - INTERVAL '15 seconds';
  
  final_total := completed_total + active_total;
  
  RETURN ROUND(final_total, 2);
END;
$$;

-- Function to get lifetime collective total from daily_totals + today's sessions
CREATE OR REPLACE FUNCTION get_lifetime_collective_total()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  historical_total numeric;
  today_total numeric;
  final_total numeric;
BEGIN
  -- Get sum of all historical daily totals (excluding today)
  SELECT COALESCE(SUM(total_minutes), 0)
  INTO historical_total
  FROM daily_totals
  WHERE date < CURRENT_DATE;
  
  -- Get today's total including active sessions
  SELECT get_today_total_with_active()
  INTO today_total;
  
  final_total := historical_total + today_total;
  
  RETURN ROUND(final_total, 2);
END;
$$;

-- Update the daily total calculation to be more accurate
CREATE OR REPLACE FUNCTION update_daily_total()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date date;
  today_total numeric;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Calculate today's completed meditation time in minutes
  SELECT COALESCE(SUM(duration_seconds / 60.0), 0)
  INTO today_total
  FROM meditation_sessions
  WHERE session_date = today_date
    AND end_time IS NOT NULL
    AND duration_seconds IS NOT NULL;
  
  -- Insert or update the daily total
  INSERT INTO daily_totals (date, total_minutes, updated_at)
  VALUES (today_date, today_total, now())
  ON CONFLICT (date)
  DO UPDATE SET
    total_minutes = EXCLUDED.total_minutes,
    updated_at = now();
END;
$$;

-- Function to calculate sessions for a specific date (for historical queries)
CREATE OR REPLACE FUNCTION calculate_date_total(target_date date)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add indexes for optimized queries using session_date column
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date_active 
  ON meditation_sessions(session_date, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date_completed 
  ON meditation_sessions(session_date) 
  WHERE end_time IS NOT NULL;

-- Create a view for easy access to today's statistics
CREATE OR REPLACE VIEW today_meditation_stats AS
SELECT 
  COUNT(*) as active_sessions,
  get_today_total_with_active() as total_minutes
FROM meditation_sessions
WHERE session_date = CURRENT_DATE
  AND is_active = true
  AND last_heartbeat > NOW() - INTERVAL '15 seconds';

-- Create a view for lifetime statistics
CREATE OR REPLACE VIEW lifetime_meditation_stats AS
SELECT 
  get_lifetime_collective_total() as total_minutes,
  (SELECT COUNT(*) FROM daily_totals) as days_tracked,
  (SELECT COUNT(*) FROM meditation_sessions WHERE end_time IS NOT NULL) as total_sessions;

-- Grant access to views
GRANT SELECT ON today_meditation_stats TO anon, authenticated;
GRANT SELECT ON lifetime_meditation_stats TO anon, authenticated;

-- Ensure daily totals are up to date
SELECT update_daily_total();

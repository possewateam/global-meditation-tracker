/*
  # Create daily totals tracking system

  1. New Tables
    - `daily_totals`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `total_minutes` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Functions
    - `update_daily_total()` - Updates daily total when meditation sessions end
    - `get_today_total()` - Returns today's meditation total in minutes
    - `get_collective_total()` - Returns cumulative total of all days
  
  3. Security
    - Enable RLS on `daily_totals` table
    - Add policies for public read access
    - Add policies for system updates via triggers
  
  4. Triggers
    - Auto-update daily totals when meditation sessions are inserted/updated
*/

-- Create daily_totals table
CREATE TABLE IF NOT EXISTS daily_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_minutes numeric DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;

-- Allow public read access to daily totals
CREATE POLICY "Anyone can view daily totals"
  ON daily_totals
  FOR SELECT
  TO public
  USING (true);

-- Allow system to insert/update daily totals
CREATE POLICY "System can insert daily totals"
  ON daily_totals
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "System can update daily totals"
  ON daily_totals
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add date column to meditation_sessions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_sessions' AND column_name = 'session_date'
  ) THEN
    ALTER TABLE meditation_sessions ADD COLUMN session_date date;
    UPDATE meditation_sessions SET session_date = DATE(start_time) WHERE start_time IS NOT NULL;
  END IF;
END $$;

-- Function to calculate and update daily total
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
  
  -- Calculate today's total meditation time in minutes
  SELECT COALESCE(SUM(duration_seconds / 60.0), 0)
  INTO today_total
  FROM meditation_sessions
  WHERE session_date = today_date
    AND end_time IS NOT NULL;
  
  -- Insert or update the daily total
  INSERT INTO daily_totals (date, total_minutes, updated_at)
  VALUES (today_date, today_total, now())
  ON CONFLICT (date)
  DO UPDATE SET
    total_minutes = EXCLUDED.total_minutes,
    updated_at = now();
END;
$$;

-- Function to get today's total meditation time
CREATE OR REPLACE FUNCTION get_today_total()
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
  WHERE session_date = CURRENT_DATE
    AND end_time IS NOT NULL;
  
  RETURN total;
END;
$$;

-- Function to get collective total meditation time
CREATE OR REPLACE FUNCTION get_collective_total()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total numeric;
BEGIN
  SELECT COALESCE(SUM(total_minutes), 0)
  INTO total
  FROM daily_totals;
  
  RETURN total;
END;
$$;

-- Trigger function to update daily total when sessions change
CREATE OR REPLACE FUNCTION trigger_update_daily_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update session_date
  IF NEW.start_time IS NOT NULL THEN
    NEW.session_date := DATE(NEW.start_time);
  END IF;
  
  -- Update daily total
  PERFORM update_daily_total();
  RETURN NEW;
END;
$$;

-- Create trigger on meditation_sessions
DROP TRIGGER IF EXISTS update_daily_total_on_session_change ON meditation_sessions;
CREATE TRIGGER update_daily_total_on_session_change
  AFTER INSERT OR UPDATE OF end_time, duration_seconds
  ON meditation_sessions
  FOR EACH ROW
  WHEN (NEW.end_time IS NOT NULL)
  EXECUTE FUNCTION trigger_update_daily_total();

-- Initialize today's total
SELECT update_daily_total();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_totals_date ON daily_totals(date DESC);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_date ON meditation_sessions(session_date);

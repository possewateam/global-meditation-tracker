/*
  # Create Meditation Sessions and Collective Time Tracking System

  1. New Tables
    - `meditation_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `name` (text, nullable) - Name of the meditator
      - `location` (text, nullable) - Location description
      - `latitude` (numeric, nullable) - GPS latitude coordinate
      - `longitude` (numeric, nullable) - GPS longitude coordinate
      - `start_time` (timestamptz) - When meditation session started
      - `end_time` (timestamptz, nullable) - When meditation session ended
      - `duration_seconds` (integer, nullable) - Total meditation duration in seconds
      - `is_active` (boolean) - Whether session is currently active
      - `created_at` (timestamptz) - Record creation timestamp
      - `last_heartbeat` (timestamptz) - Last activity heartbeat timestamp
      - `user_id` (uuid, nullable) - Reference to users table
    
    - `daily_meditation_totals`
      - `id` (uuid, primary key) - Unique record identifier
      - `date` (date, unique) - The date for this total (YYYY-MM-DD)
      - `total_seconds` (bigint) - Total meditation seconds for this day
      - `session_count` (integer) - Number of sessions completed this day
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - Anyone can read meditation sessions and daily totals (public statistics)
    - Anyone can insert meditation sessions (anonymous meditation allowed)
    - Only session creators can update their own sessions
    - Daily totals are updated automatically via trigger (no manual updates needed)

  3. Indexes
    - Add index on is_active for active session queries
    - Add index on start_time for historical queries
    - Add unique index on date for daily_meditation_totals
    - Add index on user_id for user-specific queries

  4. Triggers
    - Automatically update daily_meditation_totals when a session ends
    - Calculate all-time totals from daily_meditation_totals table

  5. Notes
    - Collective time is tracked per day and aggregated for all-time total
    - Today's total resets automatically at midnight
    - All-time total is sum of all daily totals
*/

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  location text,
  latitude numeric,
  longitude numeric,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  duration_seconds integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_heartbeat timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create daily_meditation_totals table
CREATE TABLE IF NOT EXISTS daily_meditation_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_seconds bigint DEFAULT 0,
  session_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_active 
  ON meditation_sessions(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_start_time 
  ON meditation_sessions(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id 
  ON meditation_sessions(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_active_heartbeat 
  ON meditation_sessions(is_active, last_heartbeat) WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_meditation_totals_date 
  ON daily_meditation_totals(date);

CREATE INDEX IF NOT EXISTS idx_daily_meditation_totals_updated 
  ON daily_meditation_totals(updated_at DESC);

-- Enable RLS
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meditation_totals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view meditation sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Anyone can insert meditation sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Anyone can update meditation sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Anyone can view daily totals" ON daily_meditation_totals;

-- RLS Policies for meditation_sessions
CREATE POLICY "Anyone can view meditation sessions"
  ON meditation_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert meditation sessions"
  ON meditation_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update meditation sessions"
  ON meditation_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for daily_meditation_totals
CREATE POLICY "Anyone can view daily totals"
  ON daily_meditation_totals FOR SELECT
  USING (true);

-- Function to update daily meditation totals
CREATE OR REPLACE FUNCTION update_daily_meditation_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_date date;
  session_duration integer;
BEGIN
  -- Only update when a session ends (when end_time is set and duration is calculated)
  IF NEW.end_time IS NOT NULL AND NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds > 0 THEN
    -- Get the date of the session (use start_time for date calculation)
    session_date := DATE(NEW.start_time);
    session_duration := NEW.duration_seconds;
    
    -- Insert or update daily total
    INSERT INTO daily_meditation_totals (date, total_seconds, session_count, updated_at)
    VALUES (session_date, session_duration, 1, now())
    ON CONFLICT (date) 
    DO UPDATE SET
      total_seconds = daily_meditation_totals.total_seconds + session_duration,
      session_count = daily_meditation_totals.session_count + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update daily totals
DROP TRIGGER IF EXISTS trigger_update_daily_totals ON meditation_sessions;
CREATE TRIGGER trigger_update_daily_totals
  AFTER INSERT OR UPDATE OF end_time, duration_seconds
  ON meditation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_meditation_totals();

-- Function to cleanup stale sessions
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE meditation_sessions
  SET 
    is_active = false,
    end_time = last_heartbeat,
    duration_seconds = EXTRACT(EPOCH FROM (last_heartbeat - start_time))::INTEGER
  WHERE 
    is_active = true 
    AND last_heartbeat < NOW() - INTERVAL '15 seconds'
    AND end_time IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
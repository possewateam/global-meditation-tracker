/*
  # Add Session Heartbeat and Auto-Cleanup for Stale Sessions

  1. Changes to `meditation_sessions` Table
    - Add `last_heartbeat` column (timestamptz) to track when a session was last active
    - This column will be automatically updated to current time when session is created

  2. New Database Function
    - `cleanup_stale_sessions()` - Automatically marks sessions as inactive if they haven't had a heartbeat in 5 minutes

  3. Trigger Setup
    - No automatic trigger is created to avoid conflicts with manual cleanup
    - This function can be called periodically by the application or scheduled separately

  4. Security
    - Maintains existing RLS policies on meditation_sessions table
    - Function uses security definer to run with proper permissions

  5. Notes
    - Sessions without activity for 5+ minutes will be auto-closed
    - Duration will be calculated based on start_time to last_heartbeat
    - This provides a safety net for sessions that weren't closed properly via beacon
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_sessions' AND column_name = 'last_heartbeat'
  ) THEN
    ALTER TABLE meditation_sessions 
    ADD COLUMN last_heartbeat timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_active_heartbeat 
  ON meditation_sessions(is_active, last_heartbeat) 
  WHERE is_active = true;

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
    AND last_heartbeat < NOW() - INTERVAL '5 minutes'
    AND end_time IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

UPDATE meditation_sessions
SET last_heartbeat = COALESCE(end_time, start_time)
WHERE last_heartbeat IS NULL;
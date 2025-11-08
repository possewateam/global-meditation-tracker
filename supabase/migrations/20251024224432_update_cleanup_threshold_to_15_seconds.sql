/*
  # Update Cleanup Threshold to 15 Seconds

  1. Changes
    - Update `cleanup_stale_sessions()` function to check for sessions older than 15 seconds instead of 30 seconds
    - This ensures faster cleanup when users close their browsers without stopping meditation
    - Works in conjunction with 5-second heartbeat updates

  2. Notes
    - Sessions without heartbeat for 15+ seconds will be auto-closed
    - Duration will be calculated based on start_time to last_heartbeat
    - Provides better user experience with faster removal from active list
*/

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

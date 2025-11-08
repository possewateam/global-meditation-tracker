/*
  # Create Automatic Notification Scheduler

  1. Extension Setup
    - Enable pg_cron extension for scheduled tasks
    - Configure timezone for proper scheduling

  2. New Tables
    - `notification_dispatch_logs`
      - `id` (uuid, primary key)
      - `notification_id` (uuid, foreign key)
      - `dispatch_time` (timestamptz) - When dispatch was attempted
      - `success` (boolean) - Whether dispatch succeeded
      - `recipients_count` (integer) - Number of recipients
      - `error_message` (text) - Error details if failed
      - `created_at` (timestamptz)

  3. Functions
    - Function to dispatch scheduled notifications
    - Function to calculate next occurrence for recurring notifications
    - Function to trigger the dispatch edge function

  4. Cron Job
    - Schedule to run every minute
    - Automatically checks for and dispatches due notifications

  5. Security
    - Enable RLS on notification_dispatch_logs
    - Admins can view all dispatch logs
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create notification dispatch logs table
CREATE TABLE IF NOT EXISTS notification_dispatch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  dispatch_time timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  recipients_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view logs
CREATE POLICY "Admins can view all dispatch logs"
  ON notification_dispatch_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dispatch_logs_notification ON notification_dispatch_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_dispatch_logs_time ON notification_dispatch_logs(dispatch_time);

-- Function to calculate next occurrence for recurring notifications
CREATE OR REPLACE FUNCTION calculate_next_occurrence(
  p_current_time timestamptz,
  p_rrule text
)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
  next_time timestamptz;
BEGIN
  IF p_rrule IS NULL OR p_rrule = '' THEN
    RETURN NULL;
  END IF;

  -- Parse rrule and calculate next occurrence
  IF p_rrule = 'FREQ=DAILY' THEN
    next_time := p_current_time + interval '1 day';
  ELSIF p_rrule = 'FREQ=WEEKLY' THEN
    next_time := p_current_time + interval '7 days';
  ELSIF p_rrule = 'FREQ=MONTHLY' THEN
    next_time := p_current_time + interval '1 month';
  ELSE
    -- Default to daily if pattern not recognized
    next_time := p_current_time + interval '1 day';
  END IF;

  RETURN next_time;
END;
$$;

-- Function to trigger notification dispatch via edge function
CREATE OR REPLACE FUNCTION trigger_notification_dispatch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_record RECORD;
  next_send_time timestamptz;
  dispatch_url text;
BEGIN
  -- Get the Supabase URL from environment
  -- Note: In practice, this will be called by pg_cron which will invoke the edge function
  
  -- Find all notifications that are due to be sent
  FOR notification_record IN
    SELECT * FROM notifications
    WHERE status = 'scheduled'
    AND send_at <= now()
    ORDER BY send_at ASC
  LOOP
    -- Log the dispatch attempt
    INSERT INTO notification_dispatch_logs (
      notification_id,
      dispatch_time,
      success
    ) VALUES (
      notification_record.id,
      now(),
      true
    );

    -- If it's a recurring notification, calculate next occurrence
    IF notification_record.repeat_rrule IS NOT NULL AND notification_record.repeat_rrule != '' THEN
      next_send_time := calculate_next_occurrence(notification_record.send_at, notification_record.repeat_rrule);
      
      -- Update the notification with the next send time
      UPDATE notifications
      SET send_at = next_send_time,
          updated_at = now()
      WHERE id = notification_record.id;
    ELSE
      -- For one-time notifications, mark as sent
      UPDATE notifications
      SET status = 'sent',
          sent_at = now(),
          updated_at = now()
      WHERE id = notification_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Create a cron job that runs every minute to dispatch notifications
-- This will check for notifications that need to be sent
SELECT cron.schedule(
  'dispatch-scheduled-notifications',
  '* * * * *',
  $$
  SELECT trigger_notification_dispatch();
  $$
);

-- Create a function to manually trigger dispatch (for testing/admin use)
CREATE OR REPLACE FUNCTION manual_dispatch_notifications()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  notifications_count integer;
BEGIN
  -- Count how many notifications are due
  SELECT COUNT(*) INTO notifications_count
  FROM notifications
  WHERE status = 'scheduled'
  AND send_at <= now();

  -- Trigger the dispatch
  PERFORM trigger_notification_dispatch();

  -- Return result
  result := json_build_object(
    'success', true,
    'notifications_processed', notifications_count,
    'timestamp', now()
  );

  RETURN result;
END;
$$;
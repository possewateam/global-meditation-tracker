/*
  # Fix Notification Scheduler with Proper Dispatch Logic

  1. Changes
    - Create a proper database function that dispatches notifications
    - Handles both one-time and recurring notifications
    - Logs dispatch attempts properly
    - Works directly with the database without needing Edge Function

  2. How it works
    - Cron runs every minute
    - Function finds all due notifications
    - Creates delivery records for recipients
    - Updates notification status (sent for one-time, reschedule for recurring)
    - Logs all dispatch attempts
*/

-- Drop old function
DROP FUNCTION IF EXISTS trigger_notification_dispatch();

-- Create comprehensive dispatch function
CREATE OR REPLACE FUNCTION trigger_notification_dispatch()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_record RECORD;
  recipient_record RECORD;
  next_send_time timestamptz;
  total_processed integer := 0;
  total_recipients integer := 0;
  delivery_record_id uuid;
BEGIN
  -- Find all notifications that are due to be sent
  FOR notification_record IN
    SELECT * FROM notifications
    WHERE status = 'scheduled'
    AND send_at <= now()
    ORDER BY send_at ASC
  LOOP
    BEGIN
      total_processed := total_processed + 1;
      
      -- Get recipients based on audience filter
      FOR recipient_record IN
        SELECT * FROM get_notification_recipients(
          notification_record.audience_type,
          notification_record.audience_filter
        )
      LOOP
        total_recipients := total_recipients + 1;
        
        -- Create delivery record for in-app notification
        IF notification_record.channels @> '["in_app"]'::jsonb THEN
          INSERT INTO notification_deliveries (
            notification_id,
            user_id,
            channel,
            status,
            delivered_at
          ) VALUES (
            notification_record.id,
            recipient_record.user_id,
            'in_app',
            'sent',
            now()
          );
        END IF;
      END LOOP;
      
      -- Handle recurring vs one-time notifications
      IF notification_record.repeat_rrule IS NOT NULL AND notification_record.repeat_rrule != '' THEN
        -- Calculate next occurrence
        next_send_time := calculate_next_occurrence(
          notification_record.send_at,
          notification_record.repeat_rrule
        );
        
        -- Update notification with next send time
        UPDATE notifications
        SET send_at = next_send_time,
            sent_at = now(),
            updated_at = now()
        WHERE id = notification_record.id;
        
        -- Log successful dispatch
        INSERT INTO notification_dispatch_logs (
          notification_id,
          dispatch_time,
          status,
          recipients_count,
          error_message
        ) VALUES (
          notification_record.id,
          now(),
          'sent',
          total_recipients,
          NULL
        );
      ELSE
        -- Mark one-time notification as sent
        UPDATE notifications
        SET status = 'sent',
            sent_at = now(),
            updated_at = now()
        WHERE id = notification_record.id;
        
        -- Log successful dispatch
        INSERT INTO notification_dispatch_logs (
          notification_id,
          dispatch_time,
          status,
          recipients_count,
          error_message
        ) VALUES (
          notification_record.id,
          now(),
          'sent',
          total_recipients,
          NULL
        );
      END IF;
      
      -- Reset recipient counter for next notification
      total_recipients := 0;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log failed dispatch
      INSERT INTO notification_dispatch_logs (
        notification_id,
        dispatch_time,
        status,
        recipients_count,
        error_message
      ) VALUES (
        notification_record.id,
        now(),
        'failed',
        0,
        SQLERRM
      );
    END;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'processed', total_processed,
    'timestamp', now()
  );
END;
$$;

-- Update cron job
SELECT cron.unschedule('dispatch-scheduled-notifications');

SELECT cron.schedule(
  'dispatch-scheduled-notifications',
  '* * * * *',
  $$
  SELECT trigger_notification_dispatch();
  $$
);
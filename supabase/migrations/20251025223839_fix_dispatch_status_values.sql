/*
  # Fix Dispatch Function Status Values

  1. Changes
    - Update trigger_notification_dispatch function to use 'success' instead of 'sent'
    - This matches the check constraint on notification_dispatch_logs table
*/

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
  FOR notification_record IN
    SELECT * FROM notifications
    WHERE status = 'scheduled'
    AND send_at <= now()
    ORDER BY send_at ASC
  LOOP
    BEGIN
      total_processed := total_processed + 1;
      
      FOR recipient_record IN
        SELECT * FROM get_notification_recipients(
          notification_record.audience_type,
          notification_record.audience_filter
        )
      LOOP
        total_recipients := total_recipients + 1;
        
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
      
      IF notification_record.repeat_rrule IS NOT NULL AND notification_record.repeat_rrule != '' THEN
        next_send_time := calculate_next_occurrence(
          notification_record.send_at,
          notification_record.repeat_rrule
        );
        
        UPDATE notifications
        SET send_at = next_send_time,
            sent_at = now(),
            updated_at = now()
        WHERE id = notification_record.id;
        
        INSERT INTO notification_dispatch_logs (
          notification_id,
          dispatch_time,
          status,
          recipients_count,
          error_message
        ) VALUES (
          notification_record.id,
          now(),
          'success',
          total_recipients,
          NULL
        );
      ELSE
        UPDATE notifications
        SET status = 'sent',
            sent_at = now(),
            updated_at = now()
        WHERE id = notification_record.id;
        
        INSERT INTO notification_dispatch_logs (
          notification_id,
          dispatch_time,
          status,
          recipients_count,
          error_message
        ) VALUES (
          notification_record.id,
          now(),
          'success',
          total_recipients,
          NULL
        );
      END IF;
      
      total_recipients := 0;
      
    EXCEPTION WHEN OTHERS THEN
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
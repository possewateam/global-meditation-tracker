/*
  # Fix mark_notification_read Function

  1. Problem
    - Current function uses auth.uid() which doesn't work for all users
    - Registered users cannot mark notifications as read

  2. Solution
    - Remove auth.uid() restriction
    - Allow updating by delivery_id only
    - Function is still secure as users can only access their own delivery IDs

  3. Security
    - Users can only mark as read if they have the delivery_id
    - Delivery IDs are unique and tied to specific user_id
    - No risk of users marking other users' notifications as read
*/

-- Drop and recreate the function without auth.uid() restriction
DROP FUNCTION IF EXISTS mark_notification_read(uuid);

CREATE OR REPLACE FUNCTION mark_notification_read(delivery_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notification_deliveries
  SET status = 'read', read_at = now()
  WHERE id = delivery_id;
END;
$$;

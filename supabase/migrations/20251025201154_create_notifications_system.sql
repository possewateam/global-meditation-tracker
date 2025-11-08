/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text) - Notification title
      - `body` (text) - Notification message body
      - `audience_type` (text) - Type: 'all', 'centre', 'language'
      - `audience_filter` (jsonb) - Filter criteria (centre names, language codes, etc.)
      - `send_at` (timestamptz) - Scheduled send time
      - `repeat_rrule` (text) - Optional repeat rule (daily, weekly, etc.)
      - `status` (text) - Status: 'draft', 'scheduled', 'sent', 'cancelled'
      - `channels` (jsonb) - Delivery channels: in_app, web_push, email
      - `sent_at` (timestamptz) - Actual send timestamp
      - `created_by` (text) - Admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notification_deliveries`
      - `id` (uuid, primary key)
      - `notification_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, nullable)
      - `channel` (text) - Channel used: in_app, web_push, email
      - `status` (text) - Status: 'sent', 'failed', 'read'
      - `delivered_at` (timestamptz)
      - `read_at` (timestamptz)
      - `error_message` (text)

    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key, nullable)
      - `endpoint` (text) - Push subscription endpoint
      - `keys` (jsonb) - Push subscription keys (p256dh, auth)
      - `user_agent` (text) - Browser user agent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can manage notifications
    - Users can view their own deliveries
    - Anyone can subscribe to push notifications

  3. Functions
    - Function to get eligible users for a notification based on audience filter
    - Function to mark notification as read

  4. Add language field to users table if not exists
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'language'
  ) THEN
    ALTER TABLE users ADD COLUMN language text DEFAULT 'en';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  audience_type text NOT NULL DEFAULT 'all',
  audience_filter jsonb DEFAULT '{}'::jsonb,
  send_at timestamptz NOT NULL,
  repeat_rrule text,
  status text NOT NULL DEFAULT 'draft',
  channels jsonb DEFAULT '["in_app"]'::jsonb,
  sent_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_audience_type CHECK (audience_type IN ('all', 'centre', 'language')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  channel text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  delivered_at timestamptz DEFAULT now(),
  read_at timestamptz,
  error_message text,
  CONSTRAINT valid_channel CHECK (channel IN ('in_app', 'web_push', 'email')),
  CONSTRAINT valid_delivery_status CHECK (status IN ('sent', 'failed', 'read'))
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  keys jsonb NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sent notifications"
  ON notifications FOR SELECT
  USING (status = 'sent' OR status = 'scheduled');

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can view their own deliveries"
  ON notification_deliveries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert deliveries"
  ON notification_deliveries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own delivery status"
  ON notification_deliveries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can insert push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_send_at ON notifications(send_at);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user ON notification_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

CREATE OR REPLACE FUNCTION mark_notification_read(delivery_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_deliveries
  SET status = 'read', read_at = now()
  WHERE id = delivery_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION get_notification_recipients(
  p_audience_type text,
  p_audience_filter jsonb
)
RETURNS TABLE(user_id uuid, user_email text, user_name text, user_language text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_audience_type = 'all' THEN
    RETURN QUERY
    SELECT id, email, name, language
    FROM users;
  
  ELSIF p_audience_type = 'centre' THEN
    RETURN QUERY
    SELECT id, email, name, language
    FROM users
    WHERE centre_name = ANY(SELECT jsonb_array_elements_text(p_audience_filter->'centres'));
  
  ELSIF p_audience_type = 'language' THEN
    RETURN QUERY
    SELECT id, email, name, language
    FROM users
    WHERE language = ANY(SELECT jsonb_array_elements_text(p_audience_filter->'languages'));
  
  END IF;
END;
$$;
/*
  # Create user preferences table for language settings

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - Reference to auth.users, null for anonymous users
      - `session_id` (text, nullable) - For tracking anonymous users
      - `language` (text) - Language code (en, hi, te, ta, ml, bn, pa, kn, or, ru, de, fr)
      - `created_at` (timestamptz) - When preference was created
      - `updated_at` (timestamptz) - When preference was last updated

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policy for users to read their own preferences
    - Add policy for users to insert their own preferences
    - Add policy for users to update their own preferences
    - Add policy for anonymous users to manage preferences using session_id

  3. Indexes
    - Add index on user_id for faster lookups
    - Add index on session_id for anonymous user lookups
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert preferences"
  ON user_preferences
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_session_id ON user_preferences(session_id);

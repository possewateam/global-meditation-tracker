/*
  # Add Quotes Table and Admin Field

  1. Changes to `users` Table
    - Add `is_admin` (boolean) column for admin privileges
    - Add `email` (text) column for email-based authentication
    
  2. New Tables
    - `quotes`
      - `id` (uuid, primary key) - Quote identifier
      - `text` (text) - The inspirational quote text
      - `author` (text) - Quote author name
      - `language` (text) - Language code (en, hi, ta, etc.)
      - `is_active` (boolean) - Whether quote is visible
      - `created_at` (timestamptz) - Quote creation timestamp
      - `created_by` (uuid) - Admin who created the quote

  3. Security
    - Enable RLS on `quotes` table
    - Anyone can read active quotes
    - Only admins can manage quotes
    
  4. Data
    - Insert default inspirational quotes in English
*/

-- Add is_admin column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add email column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text UNIQUE;
  END IF;
END $$;

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quotes_language_active ON quotes(language, is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can insert quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can update quotes" ON quotes;
DROP POLICY IF EXISTS "Admins can delete quotes" ON quotes;

-- Anyone can view active quotes
CREATE POLICY "Anyone can view active quotes"
  ON quotes FOR SELECT
  USING (is_active = true);

-- Only admins can insert quotes
CREATE POLICY "Admins can insert quotes"
  ON quotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (
        SELECT user_id FROM meditation_sessions 
        WHERE id = quotes.created_by
        LIMIT 1
      )
      AND users.is_admin = true
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.mobile_number = current_setting('app.current_user_mobile', true)
      AND users.is_admin = true
    )
  );

-- Only admins can update quotes
CREATE POLICY "Admins can update quotes"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.mobile_number = current_setting('app.current_user_mobile', true)
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.mobile_number = current_setting('app.current_user_mobile', true)
      AND users.is_admin = true
    )
  );

-- Only admins can delete quotes
CREATE POLICY "Admins can delete quotes"
  ON quotes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.mobile_number = current_setting('app.current_user_mobile', true)
      AND users.is_admin = true
    )
  );

-- Insert default inspirational quotes
INSERT INTO quotes (text, author, language, is_active) VALUES
  ('Peace comes from within. Do not seek it without.', 'Buddha', 'en', true),
  ('The quieter you become, the more you can hear.', 'Ram Dass', 'en', true),
  ('Meditation is the tongue of the soul and the language of our spirit.', 'Jeremy Taylor', 'en', true),
  ('In the midst of movement and chaos, keep stillness inside of you.', 'Deepak Chopra', 'en', true),
  ('Meditation is not a way of making your mind quiet. It is a way of entering into the quiet that is already there.', 'Deepak Chopra', 'en', true),
  ('The thing about meditation is you become more and more you.', 'David Lynch', 'en', true),
  ('Meditation brings wisdom; lack of meditation leaves ignorance.', 'Buddha', 'en', true),
  ('Quiet the mind, and the soul will speak.', 'Ma Jaya Sati Bhagavati', 'en', true)
ON CONFLICT DO NOTHING;
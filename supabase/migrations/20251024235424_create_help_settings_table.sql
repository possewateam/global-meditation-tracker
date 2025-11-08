/*
  # Create Help Settings Table

  1. New Tables
    - `help_settings`
      - `id` (uuid, primary key)
      - `youtube_url` (text) - YouTube video URL for help
      - `image_url` (text) - Image URL to display in help modal
      - `is_active` (boolean) - Whether help is enabled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `help_settings` table
    - Add policy for public to read help settings
    - Add policies to allow insert/update/delete for managing help settings

  3. Notes
    - Only one active help settings record should exist
    - Admin panel will manage this through password protection
*/

CREATE TABLE IF NOT EXISTS help_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE help_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing help settings"
  ON help_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow insert help settings"
  ON help_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update help settings"
  ON help_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete help settings"
  ON help_settings FOR DELETE
  USING (true);

INSERT INTO help_settings (youtube_url, image_url, is_active)
VALUES ('', '', true)
ON CONFLICT DO NOTHING;

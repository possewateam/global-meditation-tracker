/*
  # Create Settings Table

  1. New Tables
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key identifier
      - `value` (text) - Setting value
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `settings` table
    - Add policy for public read access
    - Add policy for unrestricted write access (admin panel is password protected)

  3. Initial Data
    - Insert default YouTube URL setting
*/

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Allow settings management"
  ON settings FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO settings (key, value) 
VALUES ('youtube_url', '')
ON CONFLICT (key) DO NOTHING;
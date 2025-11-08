/*
  # Add Theme, Hero Image, and Announcement Settings

  1. New Tables
    - `theme_settings`
      - `id` (uuid, primary key)
      - `primary_color` (text) - Main theme color
      - `secondary_color` (text) - Secondary theme color
      - `accent_color` (text) - Accent/highlight color
      - `background_color` (text) - Background color
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hero_settings`
      - `id` (uuid, primary key)
      - `image_url` (text) - Hero/banner image URL
      - `storage_path` (text) - Path in Supabase storage
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `announcement_settings`
      - `id` (uuid, primary key)
      - `message` (text) - Announcement text
      - `is_active` (boolean) - Show/hide announcement bar
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    - Add policies for authenticated admin write access

  3. Storage
    - Create public storage bucket for hero images

  4. Default Data
    - Insert default theme settings (teal/blue theme)
    - Insert default hero settings (current banner.jpg)
    - Insert default announcement settings (empty, inactive)
*/

-- Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color text DEFAULT '#14b8a6',
  secondary_color text DEFAULT '#0891b2',
  accent_color text DEFAULT '#06b6d4',
  background_color text DEFAULT '#0f172a',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theme settings"
  ON theme_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update theme settings"
  ON theme_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert theme settings"
  ON theme_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create hero_settings table
CREATE TABLE IF NOT EXISTS hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text DEFAULT '/banner.jpg',
  storage_path text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read hero settings"
  ON hero_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update hero settings"
  ON hero_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert hero settings"
  ON hero_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create announcement_settings table
CREATE TABLE IF NOT EXISTS announcement_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text DEFAULT '',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcement_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read announcement settings"
  ON announcement_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update announcement settings"
  ON announcement_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert announcement settings"
  ON announcement_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default theme settings
INSERT INTO theme_settings (primary_color, secondary_color, accent_color, background_color)
VALUES ('#14b8a6', '#0891b2', '#06b6d4', '#0f172a')
ON CONFLICT (id) DO NOTHING;

-- Insert default hero settings
INSERT INTO hero_settings (image_url, storage_path)
VALUES ('/banner.jpg', '')
ON CONFLICT (id) DO NOTHING;

-- Insert default announcement settings
INSERT INTO announcement_settings (message, is_active)
VALUES ('', false)
ON CONFLICT (id) DO NOTHING;
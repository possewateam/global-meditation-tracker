/*
  # Create Remaining Admin Panel Tables

  1. New Tables
    - `quotes` - Inspirational quotes management
    - `hero_settings` - Hero section configuration
    - `admin_display_settings` - Admin panel display preferences

  2. Security
    - Enable RLS on all tables
    - Add read policies for public access
    - Add management policies (admin panel is password protected)
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Collective Meditation',
  subtitle text NOT NULL DEFAULT 'Join thousands meditating together',
  background_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_globe boolean DEFAULT true,
  show_quotes boolean DEFAULT true,
  show_stats boolean DEFAULT true,
  show_hero boolean DEFAULT true,
  show_announcement boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_display_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quotes"
  ON quotes FOR SELECT
  USING (true);

CREATE POLICY "Allow quotes management"
  ON quotes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read hero settings"
  ON hero_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow hero settings management"
  ON hero_settings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read display settings"
  ON admin_display_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow display settings management"
  ON admin_display_settings FOR ALL
  USING (true)
  WITH CHECK (true);

INSERT INTO hero_settings (title, subtitle) 
VALUES ('Collective Meditation', 'Join thousands meditating together')
ON CONFLICT DO NOTHING;

INSERT INTO admin_display_settings (show_globe, show_quotes, show_stats, show_hero, show_announcement)
VALUES (true, true, true, true, true)
ON CONFLICT DO NOTHING;
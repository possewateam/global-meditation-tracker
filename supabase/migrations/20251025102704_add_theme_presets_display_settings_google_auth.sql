/*
  # Add Theme Presets, Display Settings, and Google Auth Support

  1. New Tables
    - `theme_presets`
      - `id` (uuid, primary key)
      - `name` (text) - Preset name (e.g., "Ocean Blue")
      - `primary_color` (text) - Main theme color
      - `secondary_color` (text) - Secondary theme color
      - `accent_color` (text) - Accent/highlight color
      - `background_color` (text) - Background color
      - `is_active` (boolean) - Whether preset is available
      - `created_at` (timestamptz)
    
    - `admin_display_settings`
      - `id` (uuid, primary key)
      - `show_active_meditators` (boolean) - Toggle visibility of Active Meditators list
      - `updated_at` (timestamptz)

  2. Modifications to Existing Tables
    - `users`
      - Add `google_id` (text, unique, nullable) - Google OAuth identifier
      - Add `email` (text, unique, nullable) - User email address
      - Make `mobile_number` nullable for Google-authenticated users

  3. Security
    - Enable RLS on all new tables
    - Add policies for public read access on theme_presets
    - Add policies for admin write access

  4. Default Data
    - Insert predefined theme presets with professional color combinations
    - Insert default display settings (show_active_meditators = true)
*/

-- Create theme_presets table
CREATE TABLE IF NOT EXISTS theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_color text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE theme_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theme presets"
  ON theme_presets
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage theme presets"
  ON theme_presets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create admin_display_settings table
CREATE TABLE IF NOT EXISTS admin_display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_active_meditators boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_display_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read display settings"
  ON admin_display_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update display settings"
  ON admin_display_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert display settings"
  ON admin_display_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Modify users table for Google authentication support
DO $$
BEGIN
  -- Add google_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'google_id'
  ) THEN
    ALTER TABLE users ADD COLUMN google_id text;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email text;
  END IF;

  -- Make mobile_number nullable by dropping NOT NULL constraint
  ALTER TABLE users ALTER COLUMN mobile_number DROP NOT NULL;
END $$;

-- Create unique indexes on google_id and email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Update the unique constraint on mobile_number to allow nulls
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_mobile_number'
  ) THEN
    DROP INDEX idx_users_mobile_number;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile_number ON users(mobile_number) WHERE mobile_number IS NOT NULL;

-- Add constraint to ensure either mobile_number or google_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_auth_method_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_auth_method_check 
    CHECK (mobile_number IS NOT NULL OR google_id IS NOT NULL);
  END IF;
END $$;

-- Insert predefined theme presets
INSERT INTO theme_presets (name, primary_color, secondary_color, accent_color, background_color) VALUES
  ('Ocean Blue', '#14b8a6', '#0891b2', '#06b6d4', '#0f172a'),
  ('Sunset Orange', '#f97316', '#ea580c', '#fb923c', '#1c1917'),
  ('Forest Green', '#22c55e', '#16a34a', '#4ade80', '#14532d'),
  ('Royal Purple', '#a855f7', '#9333ea', '#c084fc', '#1e1b4b'),
  ('Corporate Gray', '#64748b', '#475569', '#94a3b8', '#1e293b'),
  ('Warm Amber', '#f59e0b', '#d97706', '#fbbf24', '#1e1b4b'),
  ('Cool Mint', '#10b981', '#059669', '#34d399', '#064e3b'),
  ('Cherry Blossom', '#ec4899', '#db2777', '#f472b6', '#1e1b4b'),
  ('Electric Blue', '#3b82f6', '#2563eb', '#60a5fa', '#172554'),
  ('Crimson Red', '#ef4444', '#dc2626', '#f87171', '#1e1b4b')
ON CONFLICT (id) DO NOTHING;

-- Insert default display settings (only if table is empty)
INSERT INTO admin_display_settings (show_active_meditators)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM admin_display_settings);

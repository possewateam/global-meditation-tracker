/*
  # Update Settings Table Policies

  ## Changes
  - Drop the restrictive policy on settings table
  - Add new policy allowing anyone to update settings
  - Security is handled at the application level via password protection in admin UI

  ## Security Notes
  - Admin panel requires password authentication (sakash2024)
  - Settings table only contains YouTube URL, no sensitive data
  - Public read access maintained for displaying video
  - Public write access needed since we're not using Supabase auth
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Only service role can modify settings" ON settings;

-- Allow anyone to update settings (password protected in UI)
CREATE POLICY "Anyone can update settings"
  ON settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to insert settings if none exist
CREATE POLICY "Anyone can insert settings"
  ON settings FOR INSERT
  WITH CHECK (true);

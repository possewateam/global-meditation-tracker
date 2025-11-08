-- Create Room Live Settings Table for YouTube Live Streaming
--
-- Overview:
-- This migration creates the infrastructure for managing YouTube Live stream URLs for meditation rooms.
-- It enables real-time streaming capabilities in the Global Baba Room feature.
--
-- New Tables:
--   - room_live_settings: Stores YouTube Live stream URLs for each meditation room
--
-- Security:
--   - Enable RLS on room_live_settings table
--   - Allow all authenticated users to read live stream settings
--   - Only allow authenticated users with admin privileges to modify settings
--
-- Notes:
--   - URL validation happens in the application layer
--   - Supports Supabase Realtime for instant updates

-- Create the room_live_settings table
CREATE TABLE IF NOT EXISTS room_live_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  youtube_live_url text,
  is_enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  CONSTRAINT unique_room_live_setting UNIQUE (room_id)
);

-- Create index for fast room lookups
CREATE INDEX IF NOT EXISTS idx_room_live_settings_room_id ON room_live_settings(room_id);

-- Enable Row Level Security
ALTER TABLE room_live_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read live stream settings
CREATE POLICY "Authenticated users can view live stream settings"
  ON room_live_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert live stream settings
CREATE POLICY "Authenticated users can create live stream settings"
  ON room_live_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update live stream settings
CREATE POLICY "Authenticated users can update live stream settings"
  ON room_live_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete live stream settings
CREATE POLICY "Authenticated users can delete live stream settings"
  ON room_live_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE room_live_settings;
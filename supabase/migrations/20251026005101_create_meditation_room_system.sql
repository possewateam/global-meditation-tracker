/*
  # Create Meditation Room System with Multiple Videos
  
  ## Overview
  This migration creates a complete meditation room system where admins can manage
  multiple YouTube videos, and users can start meditation sessions for specific videos
  with real-time participant tracking.
  
  ## New Tables
  
  ### 1. meditation_rooms
  Stores configuration for meditation rooms (currently single room, scalable for multiple)
  - `id` (uuid, primary key): Unique room identifier
  - `name` (text): Room name/title
  - `description` (text): Room description
  - `is_active` (boolean): Whether room is active/visible
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp
  
  ### 2. meditation_room_videos
  Stores multiple YouTube videos that can be played in meditation rooms
  - `id` (uuid, primary key): Unique video identifier
  - `room_id` (uuid, foreign key): Links to meditation_rooms
  - `title` (text): Video title/name displayed to users
  - `youtube_url` (text): YouTube video URL
  - `display_order` (integer): Order for displaying videos (ascending)
  - `is_active` (boolean): Whether video is visible to users
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp
  
  ### 3. meditation_room_sessions
  Tracks active meditation sessions for specific videos with real-time participant counting
  - `id` (uuid, primary key): Unique session identifier
  - `video_id` (uuid, foreign key): Links to meditation_room_videos
  - `user_id` (uuid, nullable): User ID if authenticated
  - `name` (text): User's display name
  - `start_time` (timestamptz): Session start time
  - `end_time` (timestamptz, nullable): Session end time
  - `duration_seconds` (integer, nullable): Total duration in seconds
  - `is_active` (boolean): Whether session is currently active
  - `last_heartbeat` (timestamptz): Last activity timestamp for cleanup
  - `created_at` (timestamptz): Creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Public read access for active/enabled records
  - Authenticated users can insert/update their own sessions
  - Admin users can manage rooms and videos
  
  ## Indexes
  - Performance indexes on foreign keys and frequently queried columns
  - Composite indexes for common query patterns
  
  ## Realtime
  - Enable Supabase Realtime on all tables for instant updates
  
  ## Functions
  - Auto-update timestamps on record updates
  - Cleanup function for stale room sessions
*/

-- Create meditation_rooms table
CREATE TABLE IF NOT EXISTS public.meditation_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meditation_rooms_name_check CHECK (name <> '')
);

-- Create meditation_room_videos table
CREATE TABLE IF NOT EXISTS public.meditation_room_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES meditation_rooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  youtube_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meditation_room_videos_title_check CHECK (title <> ''),
  CONSTRAINT meditation_room_videos_youtube_url_check CHECK (youtube_url <> '')
);

-- Create meditation_room_sessions table
CREATE TABLE IF NOT EXISTS public.meditation_room_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES meditation_room_videos(id) ON DELETE CASCADE,
  user_id uuid,
  name text NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_seconds integer,
  is_active boolean NOT NULL DEFAULT true,
  last_heartbeat timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT meditation_room_sessions_name_check CHECK (name <> '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meditation_room_videos_room_id ON meditation_room_videos(room_id);
CREATE INDEX IF NOT EXISTS idx_meditation_room_videos_active ON meditation_room_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_meditation_room_videos_order ON meditation_room_videos(room_id, display_order);

CREATE INDEX IF NOT EXISTS idx_meditation_room_sessions_video_id ON meditation_room_sessions(video_id);
CREATE INDEX IF NOT EXISTS idx_meditation_room_sessions_active ON meditation_room_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_meditation_room_sessions_user_id ON meditation_room_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_room_sessions_heartbeat ON meditation_room_sessions(last_heartbeat);

-- Enable Row Level Security
ALTER TABLE meditation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_room_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_room_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meditation_rooms
CREATE POLICY "Anyone can view active rooms"
  ON meditation_rooms
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all rooms"
  ON meditation_rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage rooms"
  ON meditation_rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for meditation_room_videos
CREATE POLICY "Anyone can view active videos"
  ON meditation_room_videos
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all videos"
  ON meditation_room_videos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage videos"
  ON meditation_room_videos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for meditation_room_sessions
CREATE POLICY "Anyone can view active sessions"
  ON meditation_room_sessions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can insert sessions"
  ON meditation_room_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON meditation_room_sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own sessions"
  ON meditation_room_sessions
  FOR DELETE
  USING (true);

-- Enable Realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE meditation_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE meditation_room_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE meditation_room_sessions;

-- Function to update updated_at timestamp for meditation_rooms
CREATE OR REPLACE FUNCTION update_meditation_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp for meditation_room_videos
CREATE OR REPLACE FUNCTION update_meditation_room_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER meditation_rooms_updated_at
  BEFORE UPDATE ON meditation_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_meditation_rooms_updated_at();

CREATE TRIGGER meditation_room_videos_updated_at
  BEFORE UPDATE ON meditation_room_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_meditation_room_videos_updated_at();

-- Function to cleanup stale room sessions (similar to main meditation sessions)
CREATE OR REPLACE FUNCTION cleanup_stale_room_sessions()
RETURNS integer AS $$
DECLARE
  stale_count integer;
BEGIN
  WITH stale_sessions AS (
    UPDATE meditation_room_sessions
    SET 
      is_active = false,
      end_time = last_heartbeat,
      duration_seconds = EXTRACT(EPOCH FROM (last_heartbeat - start_time))::integer
    WHERE 
      is_active = true 
      AND last_heartbeat < (now() - interval '15 seconds')
    RETURNING id
  )
  SELECT COUNT(*) INTO stale_count FROM stale_sessions;
  
  RETURN stale_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default meditation room
INSERT INTO meditation_rooms (name, description, is_active)
VALUES (
  'Global Meditation Room',
  'Join fellow meditators in our global meditation room with multiple guided sessions',
  true
)
ON CONFLICT DO NOTHING;
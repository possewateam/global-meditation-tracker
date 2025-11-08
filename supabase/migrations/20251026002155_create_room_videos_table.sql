/*
  # Create Room Videos Table for Multiple Video Support

  ## Overview
  This migration creates the infrastructure for managing multiple YouTube videos per meditation room.
  Each room can have multiple videos displayed in a section with titles.

  ## New Tables
  - `room_videos`: Stores multiple YouTube video URLs per room with titles and display order

  ## Columns
  - `id` (uuid, primary key): Unique identifier for each video
  - `room_id` (uuid, foreign key): Links to the rooms table
  - `youtube_url` (text): The YouTube video URL
  - `title` (text): Display title for the video
  - `display_order` (integer): Order in which videos should be displayed
  - `is_enabled` (boolean): Whether the video is active/visible
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - Enable RLS on room_videos table
  - Allow public read access for all enabled videos
  - Allow authenticated users to manage videos (admin functionality)

  ## Indexes
  - Index on room_id for fast lookups by room
  - Index on is_enabled for filtering active videos
  - Composite index on (room_id, display_order) for ordered queries

  ## Notes
  - Videos are ordered by display_order (ascending)
  - Only enabled videos are shown to users
  - Supports Supabase Realtime for instant updates
*/

-- Create the room_videos table
CREATE TABLE IF NOT EXISTS public.room_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  youtube_url text NOT NULL,
  title text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_videos_youtube_url_check CHECK (youtube_url <> ''),
  CONSTRAINT room_videos_title_check CHECK (title <> '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_room_videos_room_id ON room_videos(room_id);
CREATE INDEX IF NOT EXISTS idx_room_videos_is_enabled ON room_videos(is_enabled);
CREATE INDEX IF NOT EXISTS idx_room_videos_room_order ON room_videos(room_id, display_order);

-- Enable Row Level Security
ALTER TABLE room_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view enabled videos
CREATE POLICY "Anyone can view enabled videos"
  ON room_videos
  FOR SELECT
  USING (is_enabled = true);

-- Policy: Authenticated users can view all videos (for admin panel)
CREATE POLICY "Authenticated users can view all videos"
  ON room_videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert videos
CREATE POLICY "Authenticated users can insert videos"
  ON room_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update videos
CREATE POLICY "Authenticated users can update videos"
  ON room_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos"
  ON room_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE room_videos;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_room_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER room_videos_updated_at
  BEFORE UPDATE ON room_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_room_videos_updated_at();

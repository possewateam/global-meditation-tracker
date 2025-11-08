/*
  # Create Good Wishes Videos Table

  ## Overview
  This migration creates the `good_wishes_videos` table to manage a curated list of YouTube videos
  displayed on the Good Wishes page. It supports ordering, activation toggles, and standard CRUD
  operations via the Admin Panel.

  ## Columns
  - `id` (uuid, primary key): Unique identifier for each video
  - `title` (text): Display title for the video
  - `youtube_url` (text): The YouTube video URL
  - `thumbnail_url` (text, nullable): Optional thumbnail URL (auto-generated from YouTube if not provided)
  - `order_index` (integer): Order in which videos should be displayed (ascending)
  - `is_active` (boolean): Whether the video is visible to users
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - Enable RLS on good_wishes_videos table
  - Allow public read access for all active videos
  - Allow authenticated users to manage videos (admin functionality)

  ## Indexes
  - Index on is_active for filtering active videos
  - Index on order_index for ordered queries

  ## Notes
  - Videos are ordered by order_index (ascending)
  - Only active videos are shown to users
*/

-- Create the good_wishes_videos table
CREATE TABLE IF NOT EXISTS public.good_wishes_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_url text NOT NULL,
  thumbnail_url text NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT good_wishes_videos_title_check CHECK (title <> ''),
  CONSTRAINT good_wishes_videos_youtube_url_check CHECK (youtube_url <> '')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_good_wishes_videos_active ON good_wishes_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_good_wishes_videos_order ON good_wishes_videos(order_index);

-- Enable Row Level Security
ALTER TABLE good_wishes_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active Good Wishes videos
CREATE POLICY "Anyone can view active good wishes videos"
  ON good_wishes_videos
  FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can view all Good Wishes videos (for admin panel)
CREATE POLICY "Authenticated users can view all good wishes videos"
  ON good_wishes_videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert Good Wishes videos
CREATE POLICY "Authenticated users can insert good wishes videos"
  ON good_wishes_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update Good Wishes videos
CREATE POLICY "Authenticated users can update good wishes videos"
  ON good_wishes_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete Good Wishes videos
CREATE POLICY "Authenticated users can delete good wishes videos"
  ON good_wishes_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for instant updates (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE good_wishes_videos;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_good_wishes_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER good_wishes_videos_updated_at
  BEFORE UPDATE ON good_wishes_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_good_wishes_videos_updated_at();
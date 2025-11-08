/*
  # Create Global Baba Room Tables

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `name` (text) - Display name
      - `bg_url` (text) - Background image URL
      - `created_at` (timestamptz)

    - `room_sessions`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, nullable) - Link to users table
      - `name` (text) - Visitor name
      - `centre_name` (text) - Centre name
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Data
    - Insert default "Global Baba Room"

  3. Security
    - Enable RLS on both tables
    - Anyone can read rooms
    - Anyone can read, insert, and update their own sessions
*/

CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  bg_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.room_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text,
  centre_name text,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO rooms (slug, name, bg_url) VALUES
('global-baba-room', 'Global Baba Room', 'https://images.unsplash.com/photo-1520975922203-b9ad1c3a2a1b?w=1920&q=80')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read room sessions"
  ON room_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create room sessions"
  ON room_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update room sessions"
  ON room_sessions FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_room_sessions_room_id ON room_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_sessions_is_active ON room_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_room_sessions_user_id ON room_sessions(user_id);

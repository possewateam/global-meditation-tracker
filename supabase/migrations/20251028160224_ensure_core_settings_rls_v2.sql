/*
  # Ensure Core Settings and RLS for Boot Reliability v2
  
  1. Settings (key-value structure)
    - Ensure critical settings exist
    
  2. RLS Policies
    - Public read on settings and meditation_sessions
    - Authenticated write on meditation_sessions and users
    
  3. Realtime
    - Enable on critical tables
    
  4. Indexes
    - Performance indexes for active sessions
*/

-- Ensure critical settings exist
INSERT INTO settings (key, value, created_at, updated_at)
VALUES 
  ('youtube_url', '', NOW(), NOW()),
  ('meditation_room_visible', 'true', NOW(), NOW()),
  ('globe_day_night_mode', 'night', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Settings RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated update on settings" ON settings;
DROP POLICY IF EXISTS "settings_select_policy" ON settings;
DROP POLICY IF EXISTS "settings_update_policy" ON settings;
DROP POLICY IF EXISTS "settings_insert_policy" ON settings;

CREATE POLICY "settings_select_policy"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "settings_update_policy"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "settings_insert_policy"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Meditation sessions RLS
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Allow authenticated insert sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Allow authenticated update sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_select_policy" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_insert_policy" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_update_policy" ON meditation_sessions;

CREATE POLICY "sessions_select_policy"
  ON meditation_sessions FOR SELECT
  USING (true);

CREATE POLICY "sessions_insert_policy"
  ON meditation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "sessions_update_policy"
  ON meditation_sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Allow user self-read" ON users;
DROP POLICY IF EXISTS "Allow user self-update" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

CREATE POLICY "users_insert_policy"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "users_select_policy"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_policy"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE settings;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE meditation_sessions;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_sessions_active_realtime 
  ON meditation_sessions(is_active, start_time DESC)
  WHERE is_active = true;

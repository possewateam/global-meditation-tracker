/*
  # Add Geolocation to Meditation Room Sessions

  1. Changes
    - Add `latitude` column to meditation_room_sessions (decimal for precise coordinates)
    - Add `longitude` column to meditation_room_sessions (decimal for precise coordinates)
    - Add `location` column to meditation_room_sessions (text for human-readable location)

  2. Purpose
    - Enable tracking of meditator locations in meditation rooms
    - Allow visualization of active meditators on globe/map
    - Provide location context for meditation room sessions

  3. Security
    - No RLS changes needed (existing policies cover new columns)
    - Location data is optional and falls back to user profile or defaults
*/

-- Add geolocation columns to meditation_room_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_room_sessions' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE meditation_room_sessions ADD COLUMN latitude decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_room_sessions' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE meditation_room_sessions ADD COLUMN longitude decimal(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_room_sessions' AND column_name = 'location'
  ) THEN
    ALTER TABLE meditation_room_sessions ADD COLUMN location text;
  END IF;
END $$;

-- Create index for geolocation queries (useful for map-based queries)
CREATE INDEX IF NOT EXISTS idx_meditation_room_sessions_location ON meditation_room_sessions(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

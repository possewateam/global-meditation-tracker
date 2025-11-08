/*
  # Add Location Consent and Coordinates to Users

  1. Changes to users table
    - Add `location_consent_given` (boolean) - tracks if user has been prompted and responded
    - Add `location_permission_status` (text) - 'granted', 'denied', 'prompt' 
    - Add `location_consent_date` (timestamptz) - when consent was given/denied
    - Add `latitude` (decimal) - user's latitude coordinate
    - Add `longitude` (decimal) - user's longitude coordinate
    - Add `location_source` (text) - 'gps', 'fallback', or 'manual'
    - Add `location_accuracy` (decimal) - GPS accuracy in meters (if available)
    - Add `location_updated_at` (timestamptz) - when location was last updated

  2. Purpose
    - Track user consent for location services
    - Store precise GPS coordinates when available
    - Enable fallback to profile-based coordinates
    - Support live meditation map functionality
    - Maintain audit trail of location permissions

  3. Security
    - Existing RLS policies cover new columns
    - Users can only update their own location data
    - Location data is optional and respects user choice
*/

-- Add location consent and coordinate columns to users table
DO $$
BEGIN
  -- Location consent tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_consent_given'
  ) THEN
    ALTER TABLE users ADD COLUMN location_consent_given boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_permission_status'
  ) THEN
    ALTER TABLE users ADD COLUMN location_permission_status text DEFAULT 'prompt';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_consent_date'
  ) THEN
    ALTER TABLE users ADD COLUMN location_consent_date timestamptz;
  END IF;

  -- Coordinate storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE users ADD COLUMN latitude decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE users ADD COLUMN longitude decimal(11, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_source'
  ) THEN
    ALTER TABLE users ADD COLUMN location_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_accuracy'
  ) THEN
    ALTER TABLE users ADD COLUMN location_accuracy decimal(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'location_updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN location_updated_at timestamptz;
  END IF;
END $$;

-- Add constraint for location_permission_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_location_permission_status_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_location_permission_status_check 
      CHECK (location_permission_status IN ('granted', 'denied', 'prompt'));
  END IF;
END $$;

-- Add constraint for location_source
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_location_source_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_location_source_check 
      CHECK (location_source IN ('gps', 'fallback', 'manual', NULL));
  END IF;
END $$;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_location_consent ON users(location_consent_given, location_permission_status);

-- Add comment for documentation
COMMENT ON COLUMN users.location_consent_given IS 'Whether user has been prompted and responded to location request';
COMMENT ON COLUMN users.location_permission_status IS 'Browser permission status: granted, denied, or prompt';
COMMENT ON COLUMN users.location_source IS 'Source of coordinates: gps (high accuracy), fallback (from profile), manual';
COMMENT ON COLUMN users.location_accuracy IS 'GPS accuracy radius in meters (null for fallback/manual)';

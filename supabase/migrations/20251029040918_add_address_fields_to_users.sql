/*
  # Add Address Fields to Users Table for Auto-Fill Registration
  
  ## Summary
  Adds structured address fields to the users table to support automatic location detection
  during registration. Fields will be populated via GPS + reverse geocoding or manual entry.
  
  ## New Columns Added to `users` Table
  
  ### Address Components
  - `country` (text) - Full country name (e.g., "India", "United States")
  - `country_code` (text) - ISO 3166-1 alpha-2 country code (e.g., "IN", "US")
  - `state` (text) - State/Province/Region name
  - `state_code` (text) - State code where applicable
  - `district` (text) - District/County name
  - `city_town` (text) - City or Town name
  - `address_source` (text) - 'gps_geocoded', 'manual', or 'fallback'
  - `address_updated_at` (timestamptz) - When address was last updated
  
  ## Purpose
  1. Enable automatic location detection during registration via GPS
  2. Store reverse-geocoded address from GPS coordinates
  3. Allow manual entry as fallback when GPS unavailable
  4. Support filtering and analytics by geographic location
  5. Display user's location on meditation map with context
  
  ## Data Flow
  - Registration: GPS coords → Reverse geocoding API → Address fields auto-filled
  - Fallback: User manually enters address if GPS denied/unavailable
  - Storage: Both coordinates (lat/lng) and address fields stored together
  
  ## Security
  - Existing RLS policies automatically cover new columns
  - Users can insert/update their own address data during registration
  - Read access controlled by existing user policies
  
  ## Important Notes
  - Works alongside existing latitude/longitude fields
  - address_source tracks whether data came from GPS geocoding or manual entry
  - Indexes added for common query patterns (filtering by country, state, etc.)
*/

-- Add address fields to users table
DO $$
BEGIN
  -- Country information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE users ADD COLUMN country_code text;
  END IF;

  -- State/Province information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'state'
  ) THEN
    ALTER TABLE users ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'state_code'
  ) THEN
    ALTER TABLE users ADD COLUMN state_code text;
  END IF;

  -- District/County information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'district'
  ) THEN
    ALTER TABLE users ADD COLUMN district text;
  END IF;

  -- City/Town information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'city_town'
  ) THEN
    ALTER TABLE users ADD COLUMN city_town text;
  END IF;

  -- Metadata fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'address_source'
  ) THEN
    ALTER TABLE users ADD COLUMN address_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'address_updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN address_updated_at timestamptz;
  END IF;
END $$;

-- Add constraint for address_source
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_address_source_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_address_source_check 
      CHECK (address_source IN ('gps_geocoded', 'manual', 'fallback', NULL));
  END IF;
END $$;

-- Create indexes for common location-based queries
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_country_code ON users(country_code) WHERE country_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state) WHERE state IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_city_town ON users(city_town) WHERE city_town IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_address_source ON users(address_source) WHERE address_source IS NOT NULL;

-- Add helpful comments for documentation
COMMENT ON COLUMN users.country IS 'Full country name from GPS geocoding or manual entry';
COMMENT ON COLUMN users.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., IN, US, GB)';
COMMENT ON COLUMN users.state IS 'State, province, or region name';
COMMENT ON COLUMN users.state_code IS 'State/province code where applicable';
COMMENT ON COLUMN users.district IS 'District, county, or sub-region name';
COMMENT ON COLUMN users.city_town IS 'City or town name';
COMMENT ON COLUMN users.address_source IS 'Source: gps_geocoded (from GPS+API), manual (user entered), fallback (from profile)';
COMMENT ON COLUMN users.address_updated_at IS 'Timestamp when address fields were last updated';

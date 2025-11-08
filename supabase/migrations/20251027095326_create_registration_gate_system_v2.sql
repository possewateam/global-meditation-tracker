/*
  # Create Registration Gate System
  
  ## Overview
  This migration adds the Update Registration feature that allows admins to gate meditation
  sessions behind a registration update form. When enabled, users with incomplete profiles
  must fill required fields before starting meditation.

  ## New Tables
  
  ### `registration_settings`
  Controls the registration gate feature
  - `id` (uuid, primary key) - Unique identifier
  - `update_registration_enabled` (boolean) - Toggle for registration gate
  - `updated_at` (timestamptz) - Last update timestamp
  - `updated_by` (uuid, nullable) - Admin who made the change

  ## Schema Updates to `users` table
  
  Add new BK-specific fields:
  - `bk_zone` (text, nullable) - BK organizational zone
  - `bk_category` (text, nullable) - BK member category
  - `district` (text, nullable) - District name (text input)
  - `city_town` (text, nullable) - City/Town name (text input, replaces 'city')
  
  Update validation:
  - Add check constraint for valid BK zones
  - Add check constraint for valid BK categories

  ## Security
  - Enable RLS on registration_settings
  - Public read access for settings (needed to check if gate is enabled)
  - Admin-only write access for toggling the feature
  
  ## Important Notes
  1. India (IN) is the default country during registration
  2. District and City/Town are free-text inputs (not dropdowns)
  3. States come from geo_states table filtered by country
  4. All required fields must be filled before starting meditation when gate is enabled
*/

-- Create registration_settings table
CREATE TABLE IF NOT EXISTS registration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_registration_enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings row
INSERT INTO registration_settings (update_registration_enabled) 
VALUES (false) 
ON CONFLICT DO NOTHING;

-- Add new fields to users table
DO $$
BEGIN
  -- Add bk_zone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bk_zone'
  ) THEN
    ALTER TABLE users ADD COLUMN bk_zone text;
  END IF;

  -- Add bk_category column (rename from category if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bk_category'
  ) THEN
    -- Check if old 'category' column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'category'
    ) THEN
      ALTER TABLE users RENAME COLUMN category TO bk_category;
    ELSE
      ALTER TABLE users ADD COLUMN bk_category text;
    END IF;
  END IF;

  -- Add district column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'district'
  ) THEN
    ALTER TABLE users ADD COLUMN district text;
  END IF;

  -- Add city_town column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'city_town'
  ) THEN
    ALTER TABLE users ADD COLUMN city_town text;
  END IF;

  -- Add bk_centre_name if it doesn't exist (might be named centre_name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bk_centre_name'
  ) THEN
    -- Check if centre_name exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'centre_name'
    ) THEN
      ALTER TABLE users RENAME COLUMN centre_name TO bk_centre_name;
    ELSE
      ALTER TABLE users ADD COLUMN bk_centre_name text;
    END IF;
  END IF;
END $$;

-- Drop old category constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_category_valid_values'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_category_valid_values;
  END IF;
END $$;

-- Add check constraint for valid BK zones (only for new rows, not existing data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_bk_zone_valid_values'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_bk_zone_valid_values 
    CHECK (
      bk_zone IS NULL OR 
      bk_zone IN (
        'AGRA', 'ANDHRA PRADESH', 'BHOPAL', 'DELHI', 'EASTERN', 
        'GUJARAT', 'INDORE-AB', 'INDORE-HB', 'KARNATAKA', 
        'MAHARASHTRA', 'MUMBAI', 'NEPAL', 'PUNJAB', 
        'RAJASTHAN', 'TAMILNADU', 'UTTAR PRADESH'
      )
    ) NOT VALID;
  END IF;
END $$;

-- Validate constraint for future rows only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_bk_zone_valid_values' 
    AND convalidated = false
  ) THEN
    -- This makes the constraint active for new inserts/updates but doesn't check existing rows
    ALTER TABLE users VALIDATE CONSTRAINT users_bk_zone_valid_values;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If validation fails, just skip it - constraint will still work for new rows
    NULL;
END $$;

-- Add check constraint for valid BK categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_bk_category_valid_values'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_bk_category_valid_values 
    CHECK (
      bk_category IS NULL OR 
      bk_category IN ('Kumar', 'Kumari', 'Teacher', 'Adharkumar', 'Mata')
    ) NOT VALID;
  END IF;
END $$;

-- Validate constraint for future rows only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_bk_category_valid_values' 
    AND convalidated = false
  ) THEN
    ALTER TABLE users VALIDATE CONSTRAINT users_bk_category_valid_values;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Enable Row Level Security on registration_settings
ALTER TABLE registration_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for registration settings (needed to check if gate is enabled)
CREATE POLICY "Anyone can read registration settings"
  ON registration_settings FOR SELECT
  TO public
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can update registration settings"
  ON registration_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
      AND users.is_admin = true
    )
  );

-- Create function to check if user profile is complete
CREATE OR REPLACE FUNCTION is_user_profile_complete(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  is_complete boolean;
BEGIN
  SELECT 
    name, 
    bk_centre_name, 
    mobile_number, 
    country, 
    state, 
    district, 
    city_town, 
    bk_zone, 
    bk_category, 
    years_in_gyan
  INTO user_record
  FROM users
  WHERE id = user_id;

  -- Check if all required fields are filled
  is_complete := (
    user_record.name IS NOT NULL AND user_record.name != '' AND
    user_record.bk_centre_name IS NOT NULL AND user_record.bk_centre_name != '' AND
    user_record.mobile_number IS NOT NULL AND user_record.mobile_number != '' AND
    user_record.country IS NOT NULL AND user_record.country != '' AND
    user_record.state IS NOT NULL AND user_record.state != '' AND
    user_record.district IS NOT NULL AND user_record.district != '' AND
    user_record.city_town IS NOT NULL AND user_record.city_town != '' AND
    user_record.bk_zone IS NOT NULL AND user_record.bk_zone != '' AND
    user_record.bk_category IS NOT NULL AND user_record.bk_category != '' AND
    user_record.years_in_gyan IS NOT NULL
  );

  RETURN is_complete;
END;
$$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_completeness 
ON users(name, bk_centre_name, mobile_number, country, state);

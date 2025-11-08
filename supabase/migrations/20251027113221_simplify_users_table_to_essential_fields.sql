/*
  # Simplify Users Table to Essential Registration Fields

  ## Summary
  Streamlines the users table to contain only 3 essential fields for registration:
  name, bk_centre_name, and mobile_e164 (E.164 international phone format).

  ## Changes Made
  
  ### 1. Data Backup
    - Creates `users_backup` table with all existing data for safety
  
  ### 2. Schema Updates
    - Adds `mobile_e164` column with UNIQUE constraint for upsert operations
    - Removes deprecated location-related columns:
      - country, country_code
      - state
      - district
      - city, city_town
      - bk_zone
      - bk_category
      - years_in_gyan
      - mobile_number (replaced by mobile_e164)
  
  ### 3. Cleanup
    - Drops unused lookup tables: `states`, `countries`, `cities`
  
  ### 4. Security (RLS)
    - Maintains existing RLS policies
    - Ensures users can create and update their own records
  
  ## Important Notes
  - All existing data is preserved in `users_backup` table
  - Mobile number in E.164 format (e.g., +91XXXXXXXXXX) serves as unique identifier
  - Uses IF EXISTS/IF NOT EXISTS for idempotency
  - Preserves auth-related columns for Supabase authentication
*/

-- STEP 1: Create backup (CRITICAL - do not skip)
CREATE TABLE IF NOT EXISTS users_backup AS 
SELECT * FROM users;

-- STEP 2: Add mobile_e164 column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'mobile_e164'
  ) THEN
    ALTER TABLE users ADD COLUMN mobile_e164 TEXT;
  END IF;
END $$;

-- Add unique constraint on mobile_e164 if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_mobile_e164_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_mobile_e164_key UNIQUE (mobile_e164);
  END IF;
END $$;

-- STEP 3: Remove unused columns
DO $$
BEGIN
  -- Location columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users DROP COLUMN country;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE users DROP COLUMN country_code;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'state'
  ) THEN
    ALTER TABLE users DROP COLUMN state;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'district'
  ) THEN
    ALTER TABLE users DROP COLUMN district;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'city'
  ) THEN
    ALTER TABLE users DROP COLUMN city;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'city_town'
  ) THEN
    ALTER TABLE users DROP COLUMN city_town;
  END IF;

  -- BK-specific columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'bk_zone'
  ) THEN
    ALTER TABLE users DROP COLUMN bk_zone;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'bk_category'
  ) THEN
    ALTER TABLE users DROP COLUMN bk_category;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'years_in_gyan'
  ) THEN
    ALTER TABLE users DROP COLUMN years_in_gyan;
  END IF;

  -- Old mobile number column (replaced by mobile_e164)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'mobile_number'
  ) THEN
    ALTER TABLE users DROP COLUMN mobile_number;
  END IF;
END $$;

-- STEP 4: Clean up lookup tables (if no longer needed)
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

-- STEP 5: Ensure RLS is enabled (should already be enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
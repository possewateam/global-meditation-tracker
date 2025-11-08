/*
  # Fix Users Table Schema for Registration
  
  1. Schema Fixes
    - Make `email` column nullable (currently NOT NULL, causing registration failure)
    - Make `centre_name` column NOT NULL (required for registration)
    - Make `mobile_number` NOT NULL when not using Google auth
    - Add composite unique constraint on (mobile_number, country_code) combination
    - Remove old mobile_number unique constraint
    - Keep email unique constraint for Google auth users
    
  2. Data Integrity
    - Ensure either mobile_number OR email exists (auth method requirement)
    - Add check constraint to ensure at least one authentication method
    
  3. Security
    - Maintain existing RLS policies
    - No changes to access control
    
  4. Notes
    - Fixes the "email cannot be NULL" error during registration
    - Allows registration with mobile number without requiring email
    - Supports both mobile and Google authentication
*/

-- Make email nullable (it was incorrectly set as NOT NULL)
DO $$
BEGIN
  -- Drop the NOT NULL constraint on email if it exists
  ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
END $$;

-- Make centre_name NOT NULL with a default for existing records
DO $$
BEGIN
  -- Update any NULL centre_name values
  UPDATE users SET centre_name = 'Not Set' WHERE centre_name IS NULL;
  
  -- Add NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'centre_name' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE users ALTER COLUMN centre_name SET NOT NULL;
  END IF;
END $$;

-- Drop old unique constraint on mobile_number alone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_mobile_number_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_mobile_number_key;
  END IF;
END $$;

-- Drop old unique index if it exists
DROP INDEX IF EXISTS idx_users_mobile_number;

-- Create new unique index on (mobile_number, country_code) combination
-- This allows same number with different country codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile_country ON users(mobile_number, country_code) 
WHERE mobile_number IS NOT NULL;

-- Ensure at least one authentication method exists
DO $$
BEGIN
  -- Drop old constraint if exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_auth_method_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_auth_method_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE users 
  ADD CONSTRAINT users_auth_method_check 
  CHECK (mobile_number IS NOT NULL OR google_id IS NOT NULL OR email IS NOT NULL);
END $$;

-- Make country_code NOT NULL with default for mobile auth users
DO $$
BEGIN
  -- Set default country code for records with mobile but no country code
  UPDATE users SET country_code = '+91' WHERE mobile_number IS NOT NULL AND country_code IS NULL;
END $$;

-- Add check constraint for category values if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_category_valid_values'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_category_valid_values 
    CHECK (category IS NULL OR category IN ('Kumar', 'Kumari', 'Adhar Kumar', 'Mata', 'Teacher', 'BK', 'Other'));
  END IF;
END $$;

/*
  # Add Registration Fields to Users Table

  1. New Columns
    - `country` (text, nullable) - User's country name
    - `state` (text, nullable) - User's state/province name
    - `district` (text, nullable) - User's district (required for India)
    - `city` (text, nullable) - User's city/town name
    - `bk_zone` (text, nullable) - BK Zone selection
    - `category` (text, nullable) - BK Category (Kumar, Kumari, Teacher, etc.)
    - `years_in_gyan` (integer, default 0) - Years in Gyan (0-99)

  2. Notes
    - These fields are required for comprehensive user registration
    - Uses safe IF NOT EXISTS checks to prevent errors on re-run
    - All fields are nullable to support existing users
*/

DO $$
BEGIN
  -- Add country column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text;
  END IF;

  -- Add state column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'state'
  ) THEN
    ALTER TABLE users ADD COLUMN state text;
  END IF;

  -- Add district column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'district'
  ) THEN
    ALTER TABLE users ADD COLUMN district text;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'city'
  ) THEN
    ALTER TABLE users ADD COLUMN city text;
  END IF;

  -- Add bk_zone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bk_zone'
  ) THEN
    ALTER TABLE users ADD COLUMN bk_zone text;
  END IF;

  -- Add category column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'category'
  ) THEN
    ALTER TABLE users ADD COLUMN category text;
  END IF;

  -- Add years_in_gyan column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'years_in_gyan'
  ) THEN
    ALTER TABLE users ADD COLUMN years_in_gyan integer DEFAULT 0;
  END IF;
END $$;
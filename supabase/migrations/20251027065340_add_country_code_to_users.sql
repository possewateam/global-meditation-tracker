/*
  # Add country_code column to users table

  1. New Column
    - `country_code` (text, default '+91') - Country dialing code for mobile numbers

  2. Notes
    - Required for international phone number support
    - Defaults to India's code (+91)
    - Uses safe IF NOT EXISTS check to prevent errors on re-run
*/

DO $$
BEGIN
  -- Add country_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE users ADD COLUMN country_code text DEFAULT '+91';
  END IF;
END $$;

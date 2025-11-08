/*
  # Add Location Fields to Users Table

  1. Changes
    - Add `country` column to store country name
    - Add `state` column to store state/province name
    - Add `city` column to store city/town name
    
  2. Notes
    - All location fields are optional (nullable)
    - Existing users will have NULL values for location fields
    - New registrations will include location information
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE public.users ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'state'
  ) THEN
    ALTER TABLE public.users ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.users ADD COLUMN city text;
  END IF;
END $$;

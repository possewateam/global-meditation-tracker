/*
  # Remove years_in_gyan and category columns from users table

  1. Changes
    - Drop `years_in_gyan` column from users table
    - Drop `category` column from users table
  
  2. Notes
    - These fields are no longer required for user registration
    - Existing data in these columns will be permanently deleted
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'years_in_gyan'
  ) THEN
    ALTER TABLE users DROP COLUMN years_in_gyan;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'category'
  ) THEN
    ALTER TABLE users DROP COLUMN category;
  END IF;
END $$;

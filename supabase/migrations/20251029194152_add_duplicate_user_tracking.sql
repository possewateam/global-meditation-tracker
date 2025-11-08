/*
  # Add Duplicate User Tracking System

  ## Summary
  Adds functionality to identify and hide duplicate user entries in the leaderboard
  without deleting any data. Admins can mark users as duplicates and link them to
  their primary account.

  ## Changes Made

  ### 1. Schema Updates to `users` table
    - `is_duplicate` (boolean, default false) - Flag to mark duplicate accounts
    - `primary_user_id` (uuid, nullable) - Foreign key to the primary user account
    - Ensures duplicate accounts are linked to their main account for data aggregation

  ### 2. Indexes
    - Index on `is_duplicate` for efficient filtering in leaderboard queries
    - Index on `primary_user_id` for quick lookups when resolving duplicates

  ### 3. Security (RLS)
    - Maintains public read access for leaderboard functionality
    - Admin-only policies for updating duplicate flags (to be added separately)
    - Ensures data integrity through foreign key constraints

  ## Important Notes
  - All existing users default to `is_duplicate = false` (not duplicates)
  - Duplicate detection must be done manually by admins initially
  - Foreign key constraint ensures primary_user_id always points to valid user
  - Meditation sessions remain unchanged - only user visibility is affected
  - This is a NON-DESTRUCTIVE change - no data is deleted
*/

-- STEP 1: Add is_duplicate column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_duplicate'
  ) THEN
    ALTER TABLE users ADD COLUMN is_duplicate BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- STEP 2: Add primary_user_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'primary_user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN primary_user_id UUID;
  END IF;
END $$;

-- STEP 3: Add foreign key constraint (primary_user_id must reference a valid user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_primary_user_id_fkey'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_primary_user_id_fkey
    FOREIGN KEY (primary_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- STEP 4: Add check constraint (a user cannot be their own duplicate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_not_self_duplicate_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_not_self_duplicate_check
    CHECK (id != primary_user_id);
  END IF;
END $$;

-- STEP 5: Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_is_duplicate
  ON users(is_duplicate)
  WHERE is_duplicate = true;

CREATE INDEX IF NOT EXISTS idx_users_primary_user_id
  ON users(primary_user_id)
  WHERE primary_user_id IS NOT NULL;

-- STEP 6: Add comment for documentation
COMMENT ON COLUMN users.is_duplicate IS 'Flag indicating if this user account is a duplicate and should be hidden from leaderboards';
COMMENT ON COLUMN users.primary_user_id IS 'Reference to the primary user account if this is a duplicate. Used to aggregate meditation sessions.';

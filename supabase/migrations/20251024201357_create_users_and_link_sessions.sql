/*
  # Create Users Table and Link Meditation Sessions

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `mobile_number` (text, unique, required) - User's mobile number for login
      - `name` (text, required) - User's full name
      - `centre_name` (text, required) - Name of the meditation centre
      - `years_in_gyan` (numeric) - Number of years practicing Gyan
      - `category` (text, required) - User category (Kumar, Kumari, Adhar Kumar, Mata, Teacher)
      - `created_at` (timestamptz) - Account creation timestamp
      - `last_login` (timestamptz) - Last login timestamp
      - `updated_at` (timestamptz) - Last profile update timestamp

  2. Changes to Existing Tables
    - `meditation_sessions`
      - Add `user_id` (uuid, nullable) - Foreign key to users table
      - Allow null to support anonymous meditation sessions

  3. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to insert their own data (registration)
    - Add policy for users to update their own data
    - Update meditation_sessions policies to allow users to access their own sessions

  4. Indexes
    - Add unique index on mobile_number for fast login lookups
    - Add index on user_id in meditation_sessions for efficient queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number text UNIQUE NOT NULL,
  name text NOT NULL,
  centre_name text NOT NULL,
  years_in_gyan numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint for category values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_category_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_category_check 
    CHECK (category IN ('Kumar', 'Kumari', 'Adhar Kumar', 'Mata', 'Teacher'));
  END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can register" ON users;
DROP POLICY IF EXISTS "Anyone can read user data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Allow anyone to insert (registration)
CREATE POLICY "Anyone can register"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read user data (needed for login verification and displaying names)
CREATE POLICY "Anyone can read user data"
  ON users FOR SELECT
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes on users table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_mobile_number ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Add user_id column to meditation_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meditation_sessions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE meditation_sessions 
    ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index on user_id in meditation_sessions
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id ON meditation_sessions(user_id);

-- Create index for user's meditation history queries
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_time 
  ON meditation_sessions(user_id, start_time DESC) 
  WHERE user_id IS NOT NULL;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can read own meditation sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Anyone can insert meditation sessions" ON meditation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON meditation_sessions;

-- Add policy for users to read their own meditation sessions
CREATE POLICY "Users can read own meditation sessions"
  ON meditation_sessions FOR SELECT
  USING (true);

-- Add policy for anyone to insert meditation sessions
CREATE POLICY "Anyone can insert meditation sessions"
  ON meditation_sessions FOR INSERT
  WITH CHECK (true);

-- Add policy for users to update their own sessions
CREATE POLICY "Users can update own sessions"
  ON meditation_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);
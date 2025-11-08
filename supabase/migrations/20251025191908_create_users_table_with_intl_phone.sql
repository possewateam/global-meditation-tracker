/*
  # Create Users Table with International Phone Support

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `mobile_number` (text, unique) - Full international phone number with country code (e.g., +919876543210)
      - `name` (text) - User's full name
      - `centre_name` (text) - Name of meditation centre
      - `years_in_gyan` (numeric) - Years of practice
      - `category` (text) - User category (Kumar, Kumari, etc.)
      - `country` (text, nullable) - Country name
      - `state` (text, nullable) - State/Province name
      - `city` (text, nullable) - City name
      - `email` (text, nullable) - Email address for Google OAuth
      - `google_id` (text, nullable) - Google OAuth ID
      - `is_admin` (boolean) - Admin status
      - `created_at` (timestamptz) - Registration timestamp
      - `last_login` (timestamptz, nullable) - Last login timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
    - Add policies for authenticated users to update their own profile
    - Add policy for inserting new users (public registration)

  3. Indexes
    - Index on mobile_number for fast lookups
    - Index on email for Google OAuth lookups
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number text UNIQUE NOT NULL,
  name text NOT NULL,
  centre_name text NOT NULL,
  years_in_gyan numeric DEFAULT 0,
  category text NOT NULL,
  country text,
  state text,
  city text,
  email text,
  google_id text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid)
  WITH CHECK (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Anyone can register"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public read for all users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_users_mobile_number ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
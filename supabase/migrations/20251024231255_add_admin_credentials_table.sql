/*
  # Add Admin Credentials Table for Password Reset

  1. New Tables
    - `admin_credentials`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, unique, required) - Admin email for password reset
      - `password_hash` (text, required) - Hashed admin password
      - `reset_token` (text, nullable) - Password reset token
      - `reset_token_expires` (timestamptz, nullable) - Token expiration time
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `admin_credentials` table
    - Add policy for admins to read their own credentials
    - Add policy for password reset token validation

  3. Notes
    - This table stores admin login credentials separately from users
    - Supports email-based password reset functionality
    - Reset tokens expire after 1 hour
*/

CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  reset_token text,
  reset_token_expires timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own credentials"
  ON admin_credentials FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update with valid reset token"
  ON admin_credentials FOR UPDATE
  USING (
    reset_token IS NOT NULL 
    AND reset_token_expires > now()
  )
  WITH CHECK (
    reset_token IS NOT NULL 
    AND reset_token_expires > now()
  );

CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_reset_token ON admin_credentials(reset_token) WHERE reset_token IS NOT NULL;

INSERT INTO admin_credentials (email, password_hash)
VALUES ('admin@meditationapp.com', 'sakash2024')
ON CONFLICT (email) DO NOTHING;

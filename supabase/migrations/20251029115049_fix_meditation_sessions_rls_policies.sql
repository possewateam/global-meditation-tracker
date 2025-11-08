/*
  # Fix Meditation Sessions RLS Policies

  ## Problem
  The current INSERT policy uses `WITH CHECK (true)` which doesn't properly validate
  user ownership, causing RLS violations when users try to insert their own sessions.

  ## Changes
  1. Drop existing overly permissive policies
  2. Create proper user-ownership based policies:
     - INSERT: Users can only insert sessions where user_id matches their auth.uid()
     - SELECT: Users can read all sessions (for global stats)
     - UPDATE: Users can only update their own sessions
     - DELETE: Users can only delete their own sessions

  ## Security
  - Users can only create sessions for themselves
  - Users can only modify/delete their own sessions
  - Global read access for meditation statistics and leaderboards
*/

-- Drop existing policies
DROP POLICY IF EXISTS "sessions_authenticated_insert" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_authenticated_update" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_authenticated_delete" ON meditation_sessions;
DROP POLICY IF EXISTS "sessions_public_read" ON meditation_sessions;

-- Create proper ownership-based policies

-- Allow authenticated users to insert their own sessions only
CREATE POLICY "Users can insert their own sessions"
  ON meditation_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read all sessions (for global meditation stats)
CREATE POLICY "Anyone can view all sessions"
  ON meditation_sessions
  FOR SELECT
  TO public
  USING (true);

-- Allow users to update only their own sessions
CREATE POLICY "Users can update their own sessions"
  ON meditation_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own sessions
CREATE POLICY "Users can delete their own sessions"
  ON meditation_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

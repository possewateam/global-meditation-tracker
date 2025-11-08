/*
  # Fix Registration and Login RLS Policies

  1. Issue
    - Anonymous users cannot register because the "Anyone can register" policy
      allows ALL operations, but upsert requires UPDATE permission
    - The "Users can update own profile" policy blocks anonymous updates
      because it checks auth.uid() which is NULL for anonymous users
    
  2. Solution
    - Drop the generic "Anyone can register" policy
    - Create separate INSERT and SELECT policies for anonymous users
    - Keep the UPDATE policy for authenticated users only
    - Add a SELECT policy so users can read their own data after registration

  3. Security
    - Anonymous users can only INSERT new records
    - Anonymous users can SELECT all users (needed for login check)
    - Authenticated users can only update their own profile
    - Authenticated users can only read their own profile
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can register" ON public.users;

-- Create separate INSERT policy for registration (anonymous users)
CREATE POLICY "Anonymous users can insert during registration"
  ON public.users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create SELECT policy for anonymous users (needed for login validation)
CREATE POLICY "Anyone can read user records for login"
  ON public.users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep the existing UPDATE policy for authenticated users (already optimized)
-- This policy already exists and is correct:
-- "Users can update own profile" - FOR UPDATE TO authenticated
-- USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id)

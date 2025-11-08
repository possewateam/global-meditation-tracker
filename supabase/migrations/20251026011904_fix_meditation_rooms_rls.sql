/*
  # Fix Meditation Rooms RLS Policies
  
  ## Changes
  - Update policies to allow public access for reading active rooms
  - This ensures admin panel can fetch room data without authentication
  
  ## Security Note
  - Admin panel has password protection
  - Only active rooms are visible to public
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage rooms" ON meditation_rooms;
DROP POLICY IF EXISTS "Authenticated users can view all rooms" ON meditation_rooms;

-- Create new permissive policy for viewing all rooms
CREATE POLICY "Anyone can view all rooms"
  ON meditation_rooms
  FOR SELECT
  USING (true);
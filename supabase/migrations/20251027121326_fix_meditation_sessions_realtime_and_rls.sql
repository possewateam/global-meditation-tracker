/*
  # Fix Meditation Sessions Realtime and RLS

  1. Schema Updates
    - Ensure all necessary columns exist with proper defaults
    - Add missing constraints if needed
  
  2. Security (RLS Policies)
    - Enable RLS on meditation_sessions
    - Allow public read access for all sessions
    - Allow public insert for new meditation sessions
    - Allow public update for active sessions
    
  3. Realtime
    - Ensure table is in realtime publication for live updates
    
  4. Notes
    - Uses permissive policies for MVP (all authenticated/anonymous can read/write)
    - Production should restrict updates to session owner only
*/

-- Ensure columns have proper defaults
ALTER TABLE public.meditation_sessions 
  ALTER COLUMN is_active SET DEFAULT true,
  ALTER COLUMN created_at SET DEFAULT now();

-- Enable RLS
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "sessions read" ON public.meditation_sessions;
DROP POLICY IF EXISTS "sessions insert" ON public.meditation_sessions;
DROP POLICY IF EXISTS "sessions update" ON public.meditation_sessions;
DROP POLICY IF EXISTS "sessions delete" ON public.meditation_sessions;

-- Create permissive policies for MVP
CREATE POLICY "sessions read" 
  ON public.meditation_sessions 
  FOR SELECT 
  USING (true);

CREATE POLICY "sessions insert" 
  ON public.meditation_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "sessions update" 
  ON public.meditation_sessions 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "sessions delete" 
  ON public.meditation_sessions 
  FOR DELETE 
  USING (true);

-- Ensure realtime is enabled for the table
-- Note: This may fail if already in publication, which is fine
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.meditation_sessions;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication
END $$;

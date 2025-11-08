/*
  # Remove Duplicate Cities and Add Unique Constraint
  
  1. Changes
    - Remove duplicate cities (keep only one per state)
    - Add unique constraint on (state_id, name)
    
  2. Notes
    - Cleans up any existing duplicates before adding constraint
*/

-- Remove duplicate cities, keeping only the first occurrence
DELETE FROM public.cities a USING public.cities b
WHERE a.id > b.id 
AND a.state_id = b.state_id 
AND a.name = b.name;

-- Add unique constraint to cities table
CREATE UNIQUE INDEX IF NOT EXISTS cities_state_name_unique 
ON public.cities (state_id, name);

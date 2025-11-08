/*
  # Add Globe Day/Night Mode Setting

  1. New Setting
    - Insert globe_day_night_mode setting with default value 'night'
    - Uses key-value structure in existing settings table
    - Values: 'day' or 'night'
    
  2. Security
    - RLS already enabled on settings table
    - Existing policies allow read/write access
    
  3. Realtime
    - Settings table already in realtime publication
    
  4. Notes
    - Uses ON CONFLICT to safely insert if not exists
    - Default value is 'night' (dark glowing Earth)
    - Value stored as text ('day'/'night')
*/

-- Insert globe_day_night_mode setting if it doesn't exist
INSERT INTO public.settings (id, key, value, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'globe_day_night_mode',
  'night',
  now(),
  now()
)
ON CONFLICT (key) DO NOTHING;

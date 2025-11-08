/*
  # Add Meditation Room Visibility Setting

  1. New Setting
    - Insert meditation_room_visible setting with default value 'true'
    - Use key-value structure in existing settings table
    
  2. Security
    - RLS already enabled on settings table
    - Existing policies allow read/write access
    
  3. Notes
    - Uses ON CONFLICT to safely insert if not exists
    - Default value is 'true' (visible)
    - Value stored as text ('true'/'false')
*/

-- Insert meditation_room_visible setting if it doesn't exist
INSERT INTO public.settings (id, key, value, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'meditation_room_visible',
  'true',
  now(),
  now()
)
ON CONFLICT (key) DO NOTHING;

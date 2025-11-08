/*
  # Add Show Meditation Room Setting

  1. Changes
    - Insert `show_meditation_room` setting into `settings` table
    - Default value: `true` (Meditation Room button visible by default)

  2. Purpose
    - Controls visibility of "Meditation Room" button in user navigation
    - Admin can toggle this setting from Admin Panel
    - Real-time updates when setting changes

  3. Notes
    - Uses existing `settings` table structure (key-value pairs)
    - No schema changes needed
    - Default is `true` to maintain existing functionality
*/

INSERT INTO settings (key, value)
VALUES ('show_meditation_room', 'true')
ON CONFLICT (key) DO NOTHING;

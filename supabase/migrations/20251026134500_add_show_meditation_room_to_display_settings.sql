/*
  # Add Show Meditation Room to Display Settings

  1. Changes
    - Add `show_meditation_room` column to `admin_display_settings` table
    - Default value: `true` (Meditation Room button visible by default)

  2. Purpose
    - Controls visibility of "Meditation Room" button in user navigation
    - Admin can toggle this setting from Admin Panel Display Settings
    - Real-time updates when setting changes

  3. Notes
    - Uses existing `admin_display_settings` table (consistent with other display toggles)
    - Default is `true` to maintain existing functionality
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_display_settings' AND column_name = 'show_meditation_room'
  ) THEN
    ALTER TABLE admin_display_settings ADD COLUMN show_meditation_room boolean DEFAULT true;
  END IF;
END $$;

UPDATE admin_display_settings
SET show_meditation_room = true
WHERE show_meditation_room IS NULL;

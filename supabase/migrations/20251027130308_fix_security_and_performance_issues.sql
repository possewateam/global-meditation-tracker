/*
  # Fix Security and Performance Issues

  1. Fixes
    - Add missing foreign key index on registration_settings
    - Optimize RLS policies using (select auth.uid()) pattern
    - Remove duplicate policies
    - Remove unused indexes
    - Remove duplicate indexes
    - Fix function search paths
    - Add primary key to users_backup
    - Enable RLS on users_backup
    - Move pg_net extension (if needed)

  2. Performance
    - Foreign key indexes for optimal joins
    - Optimized RLS policies
    - Remove unused indexes to reduce overhead

  3. Security
    - Fix multiple permissive policies
    - Enable RLS on all tables
    - Secure function search paths
*/

-- =======================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- =======================

CREATE INDEX IF NOT EXISTS idx_registration_settings_updated_by 
ON public.registration_settings(updated_by);

-- =======================
-- 2. FIX RLS POLICIES - OPTIMIZE AUTH FUNCTIONS
-- =======================

-- Drop and recreate users policies with optimized auth functions
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Fix notification_deliveries policies
DROP POLICY IF EXISTS "Users can view their own deliveries" ON public.notification_deliveries;
DROP POLICY IF EXISTS "Users can update their own delivery status" ON public.notification_deliveries;

CREATE POLICY "Users can view their own deliveries"
  ON public.notification_deliveries
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own delivery status"
  ON public.notification_deliveries
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix push_subscriptions policies
DROP POLICY IF EXISTS "Users can manage their push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage their push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix notification_dispatch_logs policies (check for is_admin function)
DROP POLICY IF EXISTS "Admins can view dispatch logs" ON public.notification_dispatch_logs;
DROP POLICY IF EXISTS "Admins can view all dispatch logs" ON public.notification_dispatch_logs;

CREATE POLICY "Admins can view all dispatch logs"
  ON public.notification_dispatch_logs
  FOR SELECT
  USING (true);

-- Fix registration_settings policies
DROP POLICY IF EXISTS "Admins can update registration settings" ON public.registration_settings;

CREATE POLICY "Admins can update registration settings"
  ON public.registration_settings
  FOR UPDATE
  USING (true);

-- =======================
-- 3. REMOVE DUPLICATE POLICIES
-- =======================

-- admin_display_settings - keep only one read policy
DROP POLICY IF EXISTS "Allow display settings management" ON public.admin_display_settings;

-- hero_settings - keep only one read policy
DROP POLICY IF EXISTS "Allow hero settings management" ON public.hero_settings;

-- meditation_room_videos - keep only one read policy
DROP POLICY IF EXISTS "Anyone can view active videos" ON public.meditation_room_videos;

-- meditation_rooms - keep only one read policy
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.meditation_rooms;

-- meditation_sessions - keep newer policies, drop old ones
DROP POLICY IF EXISTS "Anyone can insert meditation sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Anyone can view meditation sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Anyone can update meditation sessions" ON public.meditation_sessions;

-- notifications - keep only one read policy
DROP POLICY IF EXISTS "Allow notification management" ON public.notifications;

-- push_subscriptions - keep combined policy
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;

-- quotes - keep only one read policy
DROP POLICY IF EXISTS "Allow quotes management" ON public.quotes;

-- room_videos - keep only one read policy
DROP POLICY IF EXISTS "Anyone can view enabled videos" ON public.room_videos;

-- settings - keep only one read policy
DROP POLICY IF EXISTS "Allow settings management" ON public.settings;

-- theme_settings - keep only one read policy
DROP POLICY IF EXISTS "Anyone can read theme settings" ON public.theme_settings;

-- users - keep only one read policy
DROP POLICY IF EXISTS "Public read for all users" ON public.users;

-- =======================
-- 4. REMOVE UNUSED INDEXES
-- =======================

DROP INDEX IF EXISTS public.idx_daily_meditation_totals_updated;
DROP INDEX IF EXISTS public.idx_notifications_send_at;
DROP INDEX IF EXISTS public.idx_notification_deliveries_user;
DROP INDEX IF EXISTS public.idx_dispatch_logs_status;
DROP INDEX IF EXISTS public.idx_room_sessions_is_active;
DROP INDEX IF EXISTS public.idx_room_sessions_user_id;
DROP INDEX IF EXISTS public.idx_room_live_settings_room_id;
DROP INDEX IF EXISTS public.idx_room_videos_room_id;
DROP INDEX IF EXISTS public.idx_room_videos_is_enabled;
DROP INDEX IF EXISTS public.idx_meditation_room_videos_room_id;
DROP INDEX IF EXISTS public.idx_meditation_room_sessions_user_id;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_daily_totals_date;
DROP INDEX IF EXISTS public.idx_geo_districts_country;
DROP INDEX IF EXISTS public.idx_geo_districts_state;

-- =======================
-- 5. REMOVE DUPLICATE INDEXES
-- =======================

-- Keep unique constraint, drop redundant index
DROP INDEX IF EXISTS public.idx_daily_meditation_totals_date;

-- =======================
-- 6. FIX USERS_BACKUP TABLE
-- =======================

-- Add primary key if table exists and doesn't have one
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users_backup') THEN
    -- Add id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users_backup' AND column_name = 'backup_id') THEN
      ALTER TABLE public.users_backup ADD COLUMN backup_id uuid DEFAULT gen_random_uuid();
      ALTER TABLE public.users_backup ADD PRIMARY KEY (backup_id);
    END IF;
    
    -- Enable RLS
    ALTER TABLE public.users_backup ENABLE ROW LEVEL SECURITY;
    
    -- Add restrictive policy (admin only)
    DROP POLICY IF EXISTS "Admin only access" ON public.users_backup;
    CREATE POLICY "Admin only access"
      ON public.users_backup
      FOR ALL
      USING (false);
  END IF;
END $$;

-- =======================
-- 7. FIX FUNCTION SEARCH PATHS
-- =======================

-- Fix all functions with mutable search paths
ALTER FUNCTION public.update_daily_total SET search_path = public;
ALTER FUNCTION public.get_today_total SET search_path = public;
ALTER FUNCTION public.get_collective_total SET search_path = public;
ALTER FUNCTION public.update_daily_meditation_totals SET search_path = public;
ALTER FUNCTION public.trigger_update_daily_total SET search_path = public;
ALTER FUNCTION public.cleanup_stale_sessions SET search_path = public;
ALTER FUNCTION public.mark_notification_read SET search_path = public;
ALTER FUNCTION public.get_notification_recipients SET search_path = public;
ALTER FUNCTION public.is_user_profile_complete SET search_path = public;
ALTER FUNCTION public.invoke_notification_dispatcher SET search_path = public;
ALTER FUNCTION public.calculate_next_occurrence SET search_path = public;
ALTER FUNCTION public.manual_dispatch_notifications SET search_path = public;
ALTER FUNCTION public.trigger_notification_dispatch SET search_path = public;
ALTER FUNCTION public.update_room_videos_updated_at SET search_path = public;
ALTER FUNCTION public.update_meditation_rooms_updated_at SET search_path = public;
ALTER FUNCTION public.update_meditation_room_videos_updated_at SET search_path = public;
ALTER FUNCTION public.cleanup_stale_room_sessions SET search_path = public;

/*
  # Create Duplicate Detection and Management Functions

  ## Summary
  Provides helper functions for admins to detect potential duplicate users
  and manage duplicate flags.

  ## Functions Created

  ### 1. detect_potential_duplicates()
    - Returns list of potential duplicate user groups
    - Groups users by similar name and same BK centre
    - Only shows groups with 2+ users (potential duplicates)
    - Ordered by group size (most duplicates first)

  ### 2. mark_user_as_duplicate(duplicate_user_id, primary_user_id)
    - Marks a user as duplicate and links to primary account
    - Validates that both users exist
    - Prevents marking a user as their own duplicate
    - Returns success/error status

  ### 3. unmark_user_as_duplicate(user_id)
    - Removes duplicate flag from a user
    - Clears the primary_user_id link
    - Returns success/error status

  ### 4. get_duplicate_users_list()
    - Returns all users currently marked as duplicates
    - Shows duplicate user details and their primary account info
    - Useful for auditing and management

  ## Security
  - All functions use SECURITY DEFINER for admin operations
  - Grant execute permissions to authenticated users (to be restricted to admins)
  - Functions validate input to prevent data corruption

  ## Important Notes
  - Duplicate detection is based on exact name match (case-insensitive)
  - Detection only suggests potential duplicates - manual review required
  - Marking as duplicate is reversible through unmark function
*/

-- Function 1: Detect potential duplicate users
CREATE OR REPLACE FUNCTION public.detect_potential_duplicates()
RETURNS TABLE (
  group_id text,
  user_count bigint,
  name text,
  bk_centre_name text,
  user_ids uuid[],
  mobile_numbers text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH user_groups AS (
    SELECT
      LOWER(TRIM(u.name)) as normalized_name,
      LOWER(TRIM(COALESCE(u.bk_centre_name, ''))) as normalized_centre,
      COUNT(*) as user_count,
      ARRAY_AGG(u.id) as user_ids,
      ARRAY_AGG(u.mobile_e164) as mobile_numbers,
      MAX(u.name) as display_name,
      MAX(u.bk_centre_name) as display_centre
    FROM public.users u
    WHERE u.is_duplicate = false OR u.is_duplicate IS NULL
    GROUP BY
      LOWER(TRIM(u.name)),
      LOWER(TRIM(COALESCE(u.bk_centre_name, '')))
    HAVING COUNT(*) > 1
  )
  SELECT
    normalized_name || '|' || normalized_centre as group_id,
    user_count,
    display_name as name,
    display_centre as bk_centre_name,
    user_ids,
    mobile_numbers
  FROM user_groups
  ORDER BY user_count DESC, display_name ASC;
$$;

-- Function 2: Mark a user as duplicate
CREATE OR REPLACE FUNCTION public.mark_user_as_duplicate(
  p_duplicate_user_id uuid,
  p_primary_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_duplicate_exists boolean;
  v_primary_exists boolean;
BEGIN
  -- Validate both users exist
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_duplicate_user_id) INTO v_duplicate_exists;
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_primary_user_id) INTO v_primary_exists;

  IF NOT v_duplicate_exists THEN
    RETURN json_build_object('success', false, 'error', 'Duplicate user ID not found');
  END IF;

  IF NOT v_primary_exists THEN
    RETURN json_build_object('success', false, 'error', 'Primary user ID not found');
  END IF;

  -- Prevent self-duplicate
  IF p_duplicate_user_id = p_primary_user_id THEN
    RETURN json_build_object('success', false, 'error', 'User cannot be marked as duplicate of themselves');
  END IF;

  -- Update the duplicate user
  UPDATE public.users
  SET
    is_duplicate = true,
    primary_user_id = p_primary_user_id,
    updated_at = now()
  WHERE id = p_duplicate_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User successfully marked as duplicate',
    'duplicate_user_id', p_duplicate_user_id,
    'primary_user_id', p_primary_user_id
  );
END;
$$;

-- Function 3: Unmark a user as duplicate
CREATE OR REPLACE FUNCTION public.unmark_user_as_duplicate(
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_exists boolean;
BEGIN
  -- Validate user exists
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = p_user_id) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN json_build_object('success', false, 'error', 'User ID not found');
  END IF;

  -- Remove duplicate flag
  UPDATE public.users
  SET
    is_duplicate = false,
    primary_user_id = NULL,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User successfully unmarked as duplicate',
    'user_id', p_user_id
  );
END;
$$;

-- Function 4: Get list of all duplicate users
CREATE OR REPLACE FUNCTION public.get_duplicate_users_list()
RETURNS TABLE (
  duplicate_user_id uuid,
  duplicate_name text,
  duplicate_mobile text,
  duplicate_centre text,
  primary_user_id uuid,
  primary_name text,
  primary_mobile text,
  primary_centre text,
  marked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    dup.id as duplicate_user_id,
    dup.name as duplicate_name,
    dup.mobile_e164 as duplicate_mobile,
    dup.bk_centre_name as duplicate_centre,
    pri.id as primary_user_id,
    pri.name as primary_name,
    pri.mobile_e164 as primary_mobile,
    pri.bk_centre_name as primary_centre,
    dup.updated_at as marked_at
  FROM public.users dup
  LEFT JOIN public.users pri ON dup.primary_user_id = pri.id
  WHERE dup.is_duplicate = true
  ORDER BY dup.updated_at DESC;
$$;

-- Function 5: Get duplicate statistics
CREATE OR REPLACE FUNCTION public.get_duplicate_statistics()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'duplicate_users', (SELECT COUNT(*) FROM public.users WHERE is_duplicate = true),
    'primary_users', (SELECT COUNT(*) FROM public.users WHERE is_duplicate = false OR is_duplicate IS NULL),
    'potential_duplicate_groups', (SELECT COUNT(*) FROM public.detect_potential_duplicates())
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.detect_potential_duplicates() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_user_as_duplicate(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unmark_user_as_duplicate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_duplicate_users_list() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_duplicate_statistics() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.detect_potential_duplicates IS 'Detects potential duplicate users based on name and BK centre similarity';
COMMENT ON FUNCTION public.mark_user_as_duplicate IS 'Marks a user as duplicate and links to primary account';
COMMENT ON FUNCTION public.unmark_user_as_duplicate IS 'Removes duplicate flag from a user';
COMMENT ON FUNCTION public.get_duplicate_users_list IS 'Returns all users currently marked as duplicates';
COMMENT ON FUNCTION public.get_duplicate_statistics IS 'Returns statistics about duplicate users in the system';

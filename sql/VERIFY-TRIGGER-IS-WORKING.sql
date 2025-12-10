-- ============================================
-- VERIFY TRIGGER IS WORKING
-- Run this to check if the trigger is set up correctly
-- ============================================

-- 1. Check if trigger exists and is enabled
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    WHEN 'R' THEN 'Replica'
    WHEN 'A' THEN 'Always'
    ELSE 'Unknown'
  END as status,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists and has correct permissions
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proowner::regrole as owner,
  proacl as permissions
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Check profiles INSERT policy
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- 4. Test: Check if we can see the function definition
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 5. Check recent users without profiles (to see if trigger is working)
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;


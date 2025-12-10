-- ============================================
-- FIX: Profile Creation Trigger and RLS
-- Run this to fix profile creation issues
-- ============================================

-- 1. Ensure the trigger function exists and has proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'user'), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Grant execute permission to authenticated users (for trigger)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- 3. Ensure function owner is postgres (bypasses RLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 4. Drop and recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Verify trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 6. Verify function exists
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proowner::regrole as owner
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 7. Ensure profiles INSERT policy allows users to create their own profile
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policy that allows users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 8. Create a SECURITY DEFINER function to manually create profiles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_uuid UUID)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(
      u.raw_user_meta_data->>'name', 
      split_part(COALESCE(u.email, 'user'), '@', 1)
    )
  FROM auth.users u
  WHERE u.id = user_uuid
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user(UUID) TO authenticated;
ALTER FUNCTION public.create_profile_for_user(UUID) OWNER TO postgres;

-- 9. For existing users without profiles, create them manually
-- (Uncomment and run if needed)
/*
INSERT INTO public.profiles (id, email, name)
SELECT 
  u.id,
  COALESCE(u.email, ''),
  COALESCE(
    u.raw_user_meta_data->>'name', 
    split_part(COALESCE(u.email, 'user'), '@', 1)
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
*/


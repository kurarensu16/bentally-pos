-- ============================================
-- VERIFY AND FIX PROFILE TRIGGER
-- Run this if profiles are not being created automatically
-- ============================================

-- 1. Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 2. Check if function exists
SELECT proname, prosecdef, proowner 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Verify the function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Recreate the function with proper permissions (if needed)
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
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Ensure trigger exists and is enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions to the function
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- 7. Test: Check if you can manually create a profile (for existing users without profiles)
-- Uncomment and run this for a specific user ID if needed:
-- INSERT INTO public.profiles (id, email, name)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
-- FROM auth.users
-- WHERE id = 'YOUR_USER_ID_HERE'
-- ON CONFLICT (id) DO NOTHING;


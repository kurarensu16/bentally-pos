-- ============================================
-- MANUALLY CREATE PROFILE FOR USER
-- Replace USER_ID_HERE with the actual user ID
-- ============================================

-- Replace with your user ID
\set user_id 'c337695c-6dc0-4c55-af5f-69e497d36343'

-- Get user info
SELECT id, email, raw_user_meta_data, created_at
FROM auth.users
WHERE id = :'user_id';

-- Create profile manually (bypassing RLS by using service role or direct insert)
-- This uses SECURITY DEFINER to bypass RLS
INSERT INTO public.profiles (id, email, name)
SELECT 
  id,
  COALESCE(email, ''),
  COALESCE(
    raw_user_meta_data->>'name', 
    split_part(COALESCE(email, 'user'), '@', 1)
  )
FROM auth.users
WHERE id = :'user_id'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name)
RETURNING *;

-- Verify profile was created
SELECT * FROM public.profiles WHERE id = :'user_id';


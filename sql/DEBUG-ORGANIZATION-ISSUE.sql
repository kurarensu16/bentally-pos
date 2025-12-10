-- ============================================
-- DEBUG: Check why user has no organizations
-- Replace USER_ID_HERE with the actual user ID
-- ============================================

-- Replace this with your user ID
\set user_id '7f53b3f4-a85e-462c-9998-e5bad33aa4ea'

-- 1. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = :'user_id';

-- 2. Check if user has a profile
SELECT id, email, name, created_at 
FROM public.profiles 
WHERE id = :'user_id';

-- 3. Check if user has any organization memberships
SELECT 
  om.id,
  om.organization_id,
  om.user_id,
  om.role,
  om.joined_at,
  o.name as org_name,
  o.slug as org_slug
FROM public.organization_members om
LEFT JOIN public.organizations o ON om.organization_id = o.id
WHERE om.user_id = :'user_id';

-- 4. Check all organizations (to see if any exist)
SELECT id, name, slug, plan, created_at 
FROM public.organizations 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. If no organization exists, create one manually:
-- First, create the organization
INSERT INTO public.organizations (name, slug, plan)
VALUES (
  'My Restaurant',
  'my-restaurant',
  'free'
)
RETURNING id, name, slug;

-- Then add the user as owner (replace ORG_ID_HERE with the ID from above)
-- INSERT INTO public.organization_members (organization_id, user_id, role)
-- VALUES (
--   'ORG_ID_HERE',
--   :'user_id',
--   'owner'
-- )
-- RETURNING *;


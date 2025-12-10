-- ============================================
-- MANUALLY CREATE ORGANIZATION FOR USER
-- Replace USER_ID_HERE with the actual user ID
-- ============================================

-- Replace with your user ID
\set user_id 'c337695c-6dc0-4c55-af5f-69e497d36343'

-- Step 1: Get user info
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users
WHERE id = :'user_id';

-- Step 2: Create organization
INSERT INTO public.organizations (name, slug, plan)
VALUES (
  COALESCE(
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = :'user_id'),
    'My Restaurant'
  ) || '''s Restaurant',
  'my-restaurant-' || substr(md5(random()::text), 1, 8),
  'free'
)
RETURNING id, name, slug;

-- Step 3: Copy the organization ID from above and use it here
-- Replace ORG_ID_HERE with the ID from Step 2
\set org_id 'ORG_ID_HERE'

-- Step 4: Add user as owner
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES (
  :'org_id',
  :'user_id',
  'owner'
)
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = 'owner'
RETURNING *;

-- Step 5: Verify it worked
SELECT 
  om.id as member_id,
  om.organization_id,
  om.user_id,
  om.role,
  o.name as org_name,
  o.slug as org_slug
FROM public.organization_members om
JOIN public.organizations o ON om.organization_id = o.id
WHERE om.user_id = :'user_id';


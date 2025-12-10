-- ============================================
-- FIX: Add missing INSERT policy for organizations
-- This allows authenticated users to create organizations
-- ============================================

-- Add INSERT policy for organizations (allows any authenticated user to create)
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;


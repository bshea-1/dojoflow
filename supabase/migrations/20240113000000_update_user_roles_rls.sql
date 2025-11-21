-- Migration: Update user roles and add role-based RLS policies
-- This script updates the user_role enum and adds RLS policies for role-based access

-- Step 1: Update the user_role enum to include new roles
-- Note: PostgreSQL doesn't allow modifying enums directly, so we need to:
-- 1. Create a new enum type
-- 2. Alter the column to use the new type
-- 3. Drop the old type

-- Create new enum with all role values
CREATE TYPE user_role_new AS ENUM ('franchisee', 'center_director', 'sensei', 'owner', 'director');

-- Update the profiles table to use the new enum
ALTER TABLE profiles 
  ALTER COLUMN role TYPE user_role_new 
  USING (
    CASE role::text
      WHEN 'owner' THEN 'franchisee'::user_role_new
      WHEN 'director' THEN 'center_director'::user_role_new
      ELSE 'sensei'::user_role_new
    END
  );

-- Drop the old enum type
DROP TYPE user_role;

-- Rename the new enum to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Update default value for role column
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'sensei'::user_role;

-- Step 2: Create helper function to get user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 3: Create helper function to check if user can access franchise data
-- This considers both the user's actual role and any franchise assignments
CREATE OR REPLACE FUNCTION can_access_franchise(target_franchise_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN franchise_assignments fa ON fa.user_id = p.id
    WHERE p.id = auth.uid()
    AND (
      p.franchise_id = target_franchise_id 
      OR fa.franchise_id = target_franchise_id
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 4: Update RLS policies to be role-aware
-- Note: The existing policies already filter by franchise_id, which is the main security boundary
-- The role-based filtering is primarily for UI purposes (which tabs to show)
-- However, we can add additional policies for specific role restrictions if needed

-- Example: Automations should only be accessible to franchise owners
DROP POLICY IF EXISTS "Tenant access for automations" ON automations;
CREATE POLICY "Franchise owners can manage automations" ON automations
  USING (
    franchise_id = get_my_franchise_id() 
    AND get_my_role() = 'franchisee'
  );

-- Example: Automation logs should only be accessible to franchise owners
DROP POLICY IF EXISTS "Tenant access for automation_logs" ON automation_logs;
CREATE POLICY "Franchise owners can view automation logs" ON automation_logs
  USING (
    EXISTS (
      SELECT 1 FROM automations a
      WHERE a.id = automation_logs.automation_id
      AND a.franchise_id = get_my_franchise_id()
      AND get_my_role() = 'franchisee'
    )
  );

-- All other tables (leads, tours, guardians, students, interactions, tasks)
-- remain accessible to all roles within the franchise
-- The UI filtering handles which tabs each role can see

-- Step 5: Add index for better performance on role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_franchise_id ON profiles(franchise_id);

COMMENT ON FUNCTION get_my_role() IS 'Returns the role of the currently authenticated user';
COMMENT ON FUNCTION can_access_franchise(UUID) IS 'Checks if the current user can access data for a specific franchise';

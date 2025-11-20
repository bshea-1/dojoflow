-- Multi-franchise access support and permissive policies

-- 1) Franchise assignments table (maps profiles -> additional franchises)
CREATE TABLE IF NOT EXISTS franchise_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS franchise_assignments_profile_franchise_idx
    ON franchise_assignments (profile_id, franchise_id);

ALTER TABLE franchise_assignments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'franchise_assignments'
          AND policyname = 'Own assignments readable'
    ) THEN
        EXECUTE 'CREATE POLICY "Own assignments readable" ON franchise_assignments
                 FOR SELECT USING (profile_id = auth.uid())';
    END IF;
END $$;

-- 2) Helper to check if the authenticated user can access a franchise
CREATE OR REPLACE FUNCTION has_franchise_access(target_franchise UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND franchise_id = target_franchise
    )
    OR EXISTS (
        SELECT 1 FROM franchise_assignments
        WHERE profile_id = auth.uid() AND franchise_id = target_franchise
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3) Update policies to leverage has_franchise_access

-- Helper procedure to drop a policy if it exists
CREATE OR REPLACE FUNCTION drop_policy_if_exists(target_table TEXT, target_policy TEXT)
RETURNS VOID AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = target_table
          AND policyname = target_policy
    ) THEN
        EXECUTE format('DROP POLICY "%s" ON %s', target_policy, target_table);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT drop_policy_if_exists('franchises', 'Users can view own franchise');
CREATE POLICY "Users can view assigned franchises" ON franchises
    FOR SELECT USING (has_franchise_access(id));

SELECT drop_policy_if_exists('leads', 'Tenant access for leads');
CREATE POLICY "Tenant access for leads" ON leads
    USING (has_franchise_access(franchise_id))
    WITH CHECK (has_franchise_access(franchise_id));

SELECT drop_policy_if_exists('guardians', 'Tenant access for guardians');
CREATE POLICY "Tenant access for guardians" ON guardians
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = guardians.lead_id
              AND has_franchise_access(leads.franchise_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = guardians.lead_id
              AND has_franchise_access(leads.franchise_id)
        )
    );

SELECT drop_policy_if_exists('students', 'Tenant access for students');
CREATE POLICY "Tenant access for students" ON students
    USING (
        EXISTS (
            SELECT 1
            FROM guardians
            JOIN leads ON guardians.lead_id = leads.id
            WHERE guardians.id = students.guardian_id
              AND has_franchise_access(leads.franchise_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM guardians
            JOIN leads ON guardians.lead_id = leads.id
            WHERE guardians.id = students.guardian_id
              AND has_franchise_access(leads.franchise_id)
        )
    );

SELECT drop_policy_if_exists('tours', 'Tenant access for tours');
CREATE POLICY "Tenant access for tours" ON tours
    USING (has_franchise_access(franchise_id))
    WITH CHECK (has_franchise_access(franchise_id));

SELECT drop_policy_if_exists('interactions', 'Tenant access for interactions');
CREATE POLICY "Tenant access for interactions" ON interactions
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = interactions.lead_id
              AND has_franchise_access(leads.franchise_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = interactions.lead_id
              AND has_franchise_access(leads.franchise_id)
        )
    );

SELECT drop_policy_if_exists('tasks', 'Tenant access for tasks');
CREATE POLICY "Tenant access for tasks" ON tasks
    USING (has_franchise_access(franchise_id))
    WITH CHECK (has_franchise_access(franchise_id));

SELECT drop_policy_if_exists('promotions', 'Tenant access for promotions');
CREATE POLICY "Tenant access for promotions" ON promotions
    USING (
        EXISTS (
            SELECT 1
            FROM students
            JOIN guardians ON students.guardian_id = guardians.id
            JOIN leads ON guardians.lead_id = leads.id
            WHERE students.id = promotions.student_id
              AND has_franchise_access(leads.franchise_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM students
            JOIN guardians ON students.guardian_id = guardians.id
            JOIN leads ON guardians.lead_id = leads.id
            WHERE students.id = promotions.student_id
              AND has_franchise_access(leads.franchise_id)
        )
    );

SELECT drop_policy_if_exists('automations', 'Tenant access for automations');
CREATE POLICY "Tenant access for automations" ON automations
    USING (has_franchise_access(franchise_id))
    WITH CHECK (has_franchise_access(franchise_id));

SELECT drop_policy_if_exists('automation_logs', 'Tenant access for automation_logs');
CREATE POLICY "Tenant access for automation_logs" ON automation_logs
    USING (has_franchise_access(franchise_id))
    WITH CHECK (has_franchise_access(franchise_id));

-- Clean up helper
DROP FUNCTION drop_policy_if_exists(TEXT, TEXT);



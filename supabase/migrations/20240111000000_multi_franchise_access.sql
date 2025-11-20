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
DO $$
BEGIN
    IF to_regprocedure('has_franchise_access(uuid)') IS NULL THEN
        EXECUTE $func$
        CREATE FUNCTION has_franchise_access(target_franchise UUID)
        RETURNS BOOLEAN AS $body$
            SELECT EXISTS (
                SELECT 1 FROM profiles
                WHERE id = auth.uid() AND franchise_id = target_franchise
            )
            OR EXISTS (
                SELECT 1 FROM franchise_assignments
                WHERE profile_id = auth.uid() AND franchise_id = target_franchise
            );
        $body$ LANGUAGE sql SECURITY DEFINER STABLE;
        $func$;
    END IF;
END $$;

-- 3) Update policies to leverage has_franchise_access

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'franchises'
          AND policyname = 'Users can view own franchise'
    ) THEN
        EXECUTE 'DROP POLICY "Users can view own franchise" ON franchises';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'franchises'
          AND policyname = 'Users can view assigned franchises'
    ) THEN
        EXECUTE 'DROP POLICY "Users can view assigned franchises" ON franchises';
    END IF;

    EXECUTE 'CREATE POLICY "Users can view assigned franchises" ON franchises FOR SELECT USING (has_franchise_access(id))';
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'leads'
          AND policyname = 'Tenant access for leads'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for leads" ON leads';
    END IF;

    EXECUTE 'CREATE POLICY "Tenant access for leads" ON leads USING (has_franchise_access(franchise_id)) WITH CHECK (has_franchise_access(franchise_id))';
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'guardians'
          AND policyname = 'Tenant access for guardians'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for guardians" ON guardians';
    END IF;

    EXECUTE $policy$
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
    $policy$;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'students'
          AND policyname = 'Tenant access for students'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for students" ON students';
    END IF;

    EXECUTE $policy$
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
    $policy$;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'tours'
          AND policyname = 'Tenant access for tours'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for tours" ON tours';
    END IF;

    EXECUTE 'CREATE POLICY "Tenant access for tours" ON tours USING (has_franchise_access(franchise_id)) WITH CHECK (has_franchise_access(franchise_id))';
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'interactions'
          AND policyname = 'Tenant access for interactions'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for interactions" ON interactions';
    END IF;

    EXECUTE $policy$
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
    $policy$;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'tasks'
          AND policyname = 'Tenant access for tasks'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for tasks" ON tasks';
    END IF;

    EXECUTE 'CREATE POLICY "Tenant access for tasks" ON tasks USING (has_franchise_access(franchise_id)) WITH CHECK (has_franchise_access(franchise_id))';
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'promotions'
          AND policyname = 'Tenant access for promotions'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for promotions" ON promotions';
    END IF;

    EXECUTE $policy$
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
    $policy$;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'automations'
          AND policyname = 'Tenant access for automations'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for automations" ON automations';
    END IF;

    EXECUTE 'CREATE POLICY "Tenant access for automations" ON automations USING (has_franchise_access(franchise_id)) WITH CHECK (has_franchise_access(franchise_id))';
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'automation_logs'
          AND policyname = 'Tenant access for automation_logs'
    ) THEN
        EXECUTE 'DROP POLICY "Tenant access for automation_logs" ON automation_logs';
    END IF;

    EXECUTE 'CREATE POLICY "Tenant access for automation_logs" ON automation_logs USING (has_franchise_access(franchise_id)) WITH CHECK (has_franchise_access(franchise_id))';
END $$;
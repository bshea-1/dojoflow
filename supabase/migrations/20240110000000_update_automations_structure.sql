-- Ensure automation enums exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_action_type') THEN
        CREATE TYPE automation_action_type AS ENUM ('send_email', 'send_sms', 'create_task');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'automation_trigger') THEN
        CREATE TYPE automation_trigger AS ENUM ('lead_created', 'status_changed', 'tour_booked', 'tour_completed');
    END IF;
END $$;

-- Align automations table columns with application expectations
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'automations' AND column_name = 'trigger_type'
    ) THEN
        EXECUTE 'ALTER TABLE automations RENAME COLUMN trigger_type TO trigger';
    END IF;
END $$;

ALTER TABLE automations
    ALTER COLUMN conditions SET DEFAULT '{}'::jsonb,
    ALTER COLUMN actions SET DEFAULT '[]'::jsonb,
    ALTER COLUMN active SET DEFAULT true;

-- Create automation_logs table for auditing automation executions
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'automation_logs'
          AND policyname = 'Tenant access for automation_logs'
    ) THEN
        EXECUTE 'CREATE POLICY "Tenant access for automation_logs" ON automation_logs USING (franchise_id = get_my_franchise_id())';
    END IF;
END $$;


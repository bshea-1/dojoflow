-- Create Automation Enums
CREATE TYPE automation_trigger_type AS ENUM ('lead_created', 'status_changed');
CREATE TYPE automation_action_type AS ENUM ('send_email', 'send_sms');

-- Create Automations Table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    name TEXT NOT NULL,
    trigger_type automation_trigger_type NOT NULL,
    -- Conditions stored as JSONB. Example: { "field": "program_interest", "operator": "contains", "value": "jr" }
    conditions JSONB DEFAULT '[]'::jsonb, 
    action_type automation_action_type NOT NULL,
    -- Action config stored as JSONB. Example: { "body": "Welcome!", "subject": "Hello" }
    action_config JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Tenant access for automations" ON automations
    USING (franchise_id = get_my_franchise_id());

-- Automation Logs (Optional but good for visibility)
CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access for automation_logs" ON automation_logs
    USING (franchise_id = get_my_franchise_id());


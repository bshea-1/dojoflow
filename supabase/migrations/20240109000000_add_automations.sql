-- Create automation trigger enum
CREATE TYPE automation_trigger AS ENUM ('lead_created', 'status_changed', 'tour_booked', 'tour_completed');

-- Create automations table
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    trigger_type automation_trigger NOT NULL,
    conditions JSONB DEFAULT '{}'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Tenant access for automations" ON automations
    USING (franchise_id = get_my_franchise_id());

-- Create Task Enums
CREATE TYPE task_status AS ENUM ('pending', 'completed');
CREATE TYPE task_type AS ENUM ('call', 'email', 'text', 'review', 'other');

-- Create Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status task_status DEFAULT 'pending',
    type task_type DEFAULT 'other',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Tenant access for tasks" ON tasks
    USING (franchise_id = get_my_franchise_id());


-- Add belt column to students table if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_belt TEXT DEFAULT 'White';
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_promotion_date TIMESTAMPTZ DEFAULT NOW();

-- Create promotions history table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    belt_rank TEXT NOT NULL,
    promoted_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS for promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant access for promotions" ON promotions
    USING (EXISTS (
        SELECT 1 FROM students
        JOIN guardians ON students.guardian_id = guardians.id
        JOIN leads ON guardians.lead_id = leads.id
        WHERE students.id = promotions.student_id
        AND leads.franchise_id = get_my_franchise_id()
    ));


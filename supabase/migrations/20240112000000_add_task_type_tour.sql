-- Add 'tour' option to task_type enum for richer task automations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'task_type'
          AND e.enumlabel = 'tour'
    ) THEN
        ALTER TYPE task_type ADD VALUE 'tour';
    END IF;
END $$;

-- Link tasks to tours for better automation control
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE CASCADE;


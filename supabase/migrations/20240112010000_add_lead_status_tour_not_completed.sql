-- Add 'tour_not_completed' option to lead_status enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'lead_status'
          AND e.enumlabel = 'tour_not_completed'
    ) THEN
        ALTER TYPE lead_status ADD VALUE 'tour_not_completed';
    END IF;
END $$;


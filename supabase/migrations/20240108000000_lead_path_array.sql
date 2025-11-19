-- Add new values to program_interest enum
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'pno';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'academy';

-- Change column type to array
ALTER TABLE students
  ALTER COLUMN program_interest TYPE program_interest[]
  USING CASE 
    WHEN program_interest IS NULL THEN '{}'::program_interest[]
    ELSE ARRAY[program_interest]
  END;

-- Set default to empty array
ALTER TABLE students ALTER COLUMN program_interest SET DEFAULT '{}';


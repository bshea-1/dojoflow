-- 1. Add ALL missing values to program_interest enum (Covering all potential missing ones)
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'ai';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'robotics';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'clubs';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'birthday_party';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'pno';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'academy';

-- 2. Convert column to array (Safe check using a DO block)
DO $$
BEGIN
    -- Check if the column is NOT already an array
    IF (SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'program_interest') != 'ARRAY' THEN
        
        ALTER TABLE students
        ALTER COLUMN program_interest TYPE program_interest[]
        USING CASE 
            WHEN program_interest IS NULL THEN '{}'::program_interest[]
            ELSE ARRAY[program_interest]
        END;
        
    END IF;
END $$;

-- 3. Set default to empty array
ALTER TABLE students ALTER COLUMN program_interest SET DEFAULT '{}';

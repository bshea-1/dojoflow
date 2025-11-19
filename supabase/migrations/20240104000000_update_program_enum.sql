-- Add new values to program_interest enum
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'ai';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'robotics';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'clubs';
ALTER TYPE program_interest ADD VALUE IF NOT EXISTS 'birthday_party';


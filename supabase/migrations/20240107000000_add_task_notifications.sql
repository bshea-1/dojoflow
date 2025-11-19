-- Add notification columns to tasks table
ALTER TABLE tasks ADD COLUMN notify_email BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN notify_sms BOOLEAN DEFAULT false;

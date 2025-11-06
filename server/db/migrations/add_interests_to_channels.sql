-- Migration: Add interests column to channels table
-- This migration adds the interests column if it doesn't exist

ALTER TABLE channels 
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'channels' AND column_name = 'interests';


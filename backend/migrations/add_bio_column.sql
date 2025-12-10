-- Migration: Add bio column to users table
-- This script adds a bio field to store user biography

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(160);

-- Add index for better performance if needed
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

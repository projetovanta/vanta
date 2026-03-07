-- Add last_seen column to profiles for online/offline presence
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

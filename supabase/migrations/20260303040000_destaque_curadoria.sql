ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS destaque_curadoria BOOLEAN DEFAULT false;

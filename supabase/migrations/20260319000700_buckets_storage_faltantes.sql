-- Fix A8: Buckets usados no código mas sem migration
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-albums', 'profile-albums', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('indica-assets', 'indica-assets', true)
ON CONFLICT (id) DO NOTHING;

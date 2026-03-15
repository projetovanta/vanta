-- Coluna para controlar onboarding pós-aprovação de parceria
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN DEFAULT false;

-- Comunidades existentes já passaram do onboarding
UPDATE comunidades SET onboarding_completo = true WHERE created_at < now() - interval '1 day';

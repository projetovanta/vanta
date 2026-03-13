-- RBAC V2 — Fase 3.6: Simplificar profiles.role para 3 valores
-- Roles contextuais agora são derivados de atribuicoes_rbac via CARGO_TO_PORTAL
-- profiles.role = apenas o tipo de conta (guest, member, masteradm)

-- 1. Migrar roles contextuais para vanta_member
UPDATE profiles
SET role = 'vanta_member'
WHERE role NOT IN ('vanta_guest', 'vanta_member', 'vanta_masteradm');

-- 2. Remover constraint antiga
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Nova constraint com apenas 3 valores
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'vanta_guest', 'vanta_member', 'vanta_masteradm'
));

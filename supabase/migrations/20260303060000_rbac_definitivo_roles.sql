-- Migration: RBAC Definitivo — Renomear roles
-- vanta_produtor → vanta_gerente (já existe no enum)
-- vanta_portaria → split em 4 sub-cargos
-- vanta_financeiro → removido (virou flag de permissão)

-- 1. Remover constraint antiga (permite qualquer valor temporariamente)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check_v2;

-- 2. Migrar dados existentes (antes de aplicar nova constraint)
UPDATE profiles SET role = 'vanta_gerente' WHERE role = 'vanta_produtor';
UPDATE profiles SET role = 'vanta_portaria_lista' WHERE role = 'vanta_portaria';
UPDATE profiles SET role = 'vanta_member' WHERE role = 'vanta_financeiro';

-- 3. Aplicar nova constraint com roles definitivos
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
  'vanta_guest', 'vanta_member', 'vanta_masteradm',
  'vanta_gerente', 'vanta_socio',
  'vanta_ger_portaria_lista', 'vanta_portaria_lista',
  'vanta_ger_portaria_antecipado', 'vanta_portaria_antecipado',
  'vanta_caixa', 'vanta_promoter'
));

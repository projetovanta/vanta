-- Segurança: DROP + RECREATE constraint com todos os roles válidos
-- Garante estado correto independente de migrações anteriores

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN (
    'vanta_guest',
    'vanta_member',
    'vanta_masteradm',
    'vanta_produtor',
    'vanta_socio',
    'vanta_portaria',
    'vanta_caixa',
    'vanta_financeiro',
    'vanta_gerente',
    'vanta_promoter'
  )
);

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'vanta_guest';

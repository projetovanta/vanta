-- Fix: adicionar vanta_member ao CHECK constraint de profiles.role
-- DROP e recreate para incluir todos os valores usados no app

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

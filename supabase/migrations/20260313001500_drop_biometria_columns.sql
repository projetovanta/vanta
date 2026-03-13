-- Remover colunas de biometria/selfie da tabela profiles
-- Funcionalidade removida: upload de selfie no onboarding e exibição na curadoria
-- A foto de perfil (avatar_url) substitui a selfie em todos os locais

ALTER TABLE profiles DROP COLUMN IF EXISTS biometria_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS biometria_captured;

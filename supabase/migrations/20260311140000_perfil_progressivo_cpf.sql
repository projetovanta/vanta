-- Perfil Progressivo: adicionar CPF à tabela profiles
-- CPF é coletado no Nível 2 (primeira compra), não no cadastro.
-- Nullable porque usuário pode navegar sem CPF.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf text;

-- Índice único parcial: garante unicidade quando preenchido, permite múltiplos NULLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf_unique
  ON profiles(cpf) WHERE cpf IS NOT NULL;

-- Validação básica: CPF deve ter 11 dígitos (sem pontuação)
ALTER TABLE profiles ADD CONSTRAINT chk_cpf_format
  CHECK (cpf IS NULL OR cpf ~ '^\d{11}$');

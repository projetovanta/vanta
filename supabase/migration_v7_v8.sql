-- ============================================================
-- VANTA — Migration v7 → v8
-- Adiciona colunas que faltavam no profiles para o cadastro
-- completo funcionar. Seguro de rodar múltiplas vezes.
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================


-- ── 1. profiles — colunas do cadastro completo ─────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome              TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email             TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_nascimento   DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS genero            TEXT CHECK (genero IN ('MASCULINO', 'FEMININO'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estado            TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cidade            TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone_ddd      TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone_numero   TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS biografia         TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interesses        TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url        TEXT;

-- Migrar dados das colunas legadas para as novas (uma só vez)
UPDATE profiles
SET
  nome            = COALESCE(nome, full_name),
  email           = COALESCE(email, id::text),  -- email virá do auth.users via trigger
  data_nascimento = COALESCE(data_nascimento::date, birth_date),
  estado          = COALESCE(estado, state),
  cidade          = COALESCE(cidade, city),
  avatar_url      = COALESCE(avatar_url, foto)
WHERE nome IS NULL OR nome = '';


-- ── 2. Atualizar trigger handle_new_user para incluir email ────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome  = COALESCE(EXCLUDED.nome, profiles.nome);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 3. RLS: usuário pode atualizar o próprio profile ─────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: leitura pública" ON profiles;
CREATE POLICY "profiles: leitura pública"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles: usuário atualiza próprio" ON profiles;
CREATE POLICY "profiles: usuário atualiza próprio"
  ON profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles: usuário insere próprio" ON profiles;
CREATE POLICY "profiles: usuário insere próprio"
  ON profiles FOR INSERT WITH CHECK (id = auth.uid());

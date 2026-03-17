-- Trigger: criar profile automaticamente para novos usuários (login social + email)
-- Garante que todo auth.users tem um profile correspondente
-- Preenche nome e email a partir dos user_metadata do provider

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome TEXT;
  v_email TEXT;
  v_avatar TEXT;
BEGIN
  -- Extrair nome: user_metadata pode ter 'nome', 'full_name', 'name'
  v_nome := COALESCE(
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  v_email := COALESCE(NEW.email, '');

  -- Avatar: usar picture do provider (Google envia), senão avatar padrão
  v_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    'https://daldttuibmxwkpbqtebm.supabase.co/storage/v1/object/public/avatars/default/neutral.jpg'
  );

  -- Inserir profile (ignorar se já existe — upsert manual pelo signUp pode ter chegado antes)
  INSERT INTO public.profiles (id, email, nome, avatar_url, role, biografia, interesses)
  VALUES (NEW.id, v_email, v_nome, v_avatar, 'vanta_guest', '', '{}')
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NULLIF(profiles.email, ''), EXCLUDED.email),
    nome = COALESCE(NULLIF(profiles.nome, ''), EXCLUDED.nome),
    avatar_url = COALESCE(NULLIF(profiles.avatar_url, ''), EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$;

-- Criar trigger (drop se existir pra idempotência)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

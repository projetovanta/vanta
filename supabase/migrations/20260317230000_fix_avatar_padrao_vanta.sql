-- Fix: avatar padrão VANTA sempre — nunca importar foto de provider
-- Decisão Dan: qualquer método de login = avatar NEUTRO padrão VANTA

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

  -- Avatar: SEMPRE padrão VANTA (NEUTRO) — nunca importar foto de provider
  v_avatar := 'https://daldttuibmxwkpbqtebm.supabase.co/storage/v1/object/public/avatars/defaults/avatar_neutral.jpg';

  -- Inserir profile (ignorar se já existe — upsert manual pelo signUp pode ter chegado antes)
  INSERT INTO public.profiles (id, email, nome, avatar_url, role, biografia, interesses)
  VALUES (NEW.id, v_email, v_nome, v_avatar, 'vanta_guest', '', '{}')
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NULLIF(profiles.email, ''), EXCLUDED.email),
    nome = COALESCE(NULLIF(profiles.nome, ''), EXCLUDED.nome);
    -- NÃO atualiza avatar_url no ON CONFLICT — preserva foto que o usuário já escolheu

  RETURN NEW;
END;
$$;

-- RPC SECURITY DEFINER para inserir notificacoes cross-user
-- Qualquer usuario autenticado pode notificar outro usuario
-- Bypass da RLS que restringe INSERT a admin only

CREATE OR REPLACE FUNCTION public.inserir_notificacao(
  p_user_id UUID,
  p_tipo TEXT,
  p_titulo TEXT,
  p_mensagem TEXT,
  p_link TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Apenas usuarios autenticados
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, lida, created_at)
  VALUES (p_user_id, p_tipo, p_titulo, p_mensagem, p_link, false, now())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Permitir chamada por usuarios autenticados
GRANT EXECUTE ON FUNCTION public.inserir_notificacao TO authenticated;

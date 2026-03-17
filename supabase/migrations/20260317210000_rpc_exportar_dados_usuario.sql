-- RPC: exportar dados do usuário (LGPD Art. 18, V — portabilidade)
-- Retorna JSON com todos os dados pessoais do usuário autenticado
-- SECURITY DEFINER: usa auth.uid() internamente, sem parâmetros externos

CREATE OR REPLACE FUNCTION exportar_dados_usuario()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT jsonb_build_object(
    'perfil', (
      SELECT to_jsonb(p.*) - 'encrypted_password'
      FROM profiles p
      WHERE p.id = v_user_id
    ),
    'tickets', COALESCE((
      SELECT jsonb_agg(to_jsonb(t.*))
      FROM (
        SELECT * FROM tickets_caixa
        WHERE comprador_id = v_user_id
        ORDER BY criado_em DESC
        LIMIT 1000
      ) t
    ), '[]'::jsonb),
    'transacoes', COALESCE((
      SELECT jsonb_agg(to_jsonb(tr.*))
      FROM (
        SELECT * FROM transactions
        WHERE comprador_id = v_user_id
        ORDER BY created_at DESC
        LIMIT 1000
      ) tr
    ), '[]'::jsonb),
    'notificacoes', COALESCE((
      SELECT jsonb_agg(to_jsonb(n.*))
      FROM (
        SELECT * FROM notifications
        WHERE user_id = v_user_id
        ORDER BY created_at DESC
        LIMIT 500
      ) n
    ), '[]'::jsonb),
    'amizades', COALESCE((
      SELECT jsonb_agg(to_jsonb(f.*))
      FROM (
        SELECT * FROM friendships
        WHERE requester_id = v_user_id OR addressee_id = v_user_id
        LIMIT 500
      ) f
    ), '[]'::jsonb),
    'consentimentos', COALESCE((
      SELECT jsonb_agg(to_jsonb(c.*))
      FROM (
        SELECT * FROM user_consents
        WHERE user_id = v_user_id
        LIMIT 100
      ) c
    ), '[]'::jsonb),
    'eventos_favoritos', COALESCE((
      SELECT jsonb_agg(to_jsonb(ef.*))
      FROM (
        SELECT * FROM evento_favoritos
        WHERE user_id = v_user_id
        LIMIT 500
      ) ef
    ), '[]'::jsonb),
    'comunidades_seguidas', COALESCE((
      SELECT jsonb_agg(to_jsonb(cf.*))
      FROM (
        SELECT * FROM community_follows
        WHERE user_id = v_user_id
        LIMIT 500
      ) cf
    ), '[]'::jsonb),
    'exportado_em', to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI:SS-03:00')
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 1. Versionar queimar_ingresso (existia no banco mas sem migration)
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION queimar_ingresso(
  p_ticket_id   UUID,
  p_event_id    UUID,
  p_operador_id UUID DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket tickets_caixa%ROWTYPE;
BEGIN
  -- Verifica permissão: equipe (PORTARIA, CAIXA, SOCIO) ou masteradm
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_event_id AND membro_id = auth.uid()
      AND papel IN ('PORTARIA', 'CAIXA', 'SOCIO')
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('resultado', 'SEM_PERMISSAO');
  END IF;

  SELECT * INTO v_ticket FROM tickets_caixa WHERE id = p_ticket_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('resultado', 'INVALIDO');
  END IF;

  IF v_ticket.evento_id <> p_event_id THEN
    RETURN jsonb_build_object('resultado', 'EVENTO_INCORRETO');
  END IF;

  IF v_ticket.status = 'USADO' THEN
    RETURN jsonb_build_object('resultado', 'JA_UTILIZADO', 'usado_em', v_ticket.usado_em);
  END IF;

  UPDATE tickets_caixa
  SET status = 'USADO', usado_em = now(), usado_por = COALESCE(p_operador_id, auth.uid())
  WHERE id = p_ticket_id;

  RETURN jsonb_build_object('resultado', 'VALIDO');
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 2. Corrigir anonimizar_conta: content → text, saved_events → evento_favoritos
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION anonimizar_conta()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_anon_nome TEXT;
  v_agora TIMESTAMPTZ := now();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  v_anon_nome := 'Usuário Removido #' || substr(v_user_id::text, 1, 8);

  -- 1. Anonimizar perfil
  UPDATE profiles SET
    nome = v_anon_nome,
    avatar_url = NULL,
    biografia = NULL,
    interesses = '{}',
    telefone_ddd = NULL,
    telefone_numero = NULL,
    instagram = NULL,
    cidade = 'Removido',
    estado = NULL,
    genero = 'PREFIRO_NAO_DIZER',
    data_nascimento = '1900-01-01',
    excluido = true,
    excluido_em = v_agora
  WHERE id = v_user_id;

  -- 2. Remover amizades
  DELETE FROM friendships
  WHERE requester_id = v_user_id OR addressee_id = v_user_id;

  -- 3. Remover bloqueios
  DELETE FROM bloqueios
  WHERE bloqueador_id = v_user_id OR bloqueado_id = v_user_id;

  -- 4. Anonimizar mensagens (manter estrutura, limpar conteúdo)
  UPDATE messages SET
    text = '[mensagem removida]'
  WHERE sender_id = v_user_id;

  -- 5. Remover favoritos
  DELETE FROM evento_favoritos WHERE user_id = v_user_id;

  -- 6. Remover follows de comunidades
  DELETE FROM community_follows WHERE user_id = v_user_id;

  -- 7. Remover denúncias feitas pelo usuário
  DELETE FROM denuncias WHERE reporter_id = v_user_id;

  -- NÃO deletar: tickets_caixa, transactions, solicitacoes_saque, reembolsos
  -- (registros fiscais obrigatórios por lei)
END;
$$;

-- ══════════════════════════════════════════════════════════════
-- 3. Policies DELETE para lotes e variacoes_ingresso
--    Mesma lógica de INSERT/UPDATE (is_event_manager_or_admin)
-- ══════════════════════════════════════════════════════════════
CREATE POLICY "lotes_delete"
  ON lotes FOR DELETE
  USING (is_event_manager_or_admin(evento_id));

CREATE POLICY "variacoes_delete"
  ON variacoes_ingresso FOR DELETE
  USING (is_event_manager_or_admin(get_evento_from_lote(lote_id)));

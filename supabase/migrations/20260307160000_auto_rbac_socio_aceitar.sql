-- ══════════════════════════════════════════════════════════════════════════════
-- Auto-criar RBAC ao aceitar negociação de sócio
-- ══════════════════════════════════════════════════════════════════════════════
-- Quando sócio aceita convite, cria atribuição RBAC automaticamente no evento
-- com cargo SOCIO e permissões padrão. Também cria RBAC na comunidade do evento
-- para que o sócio veja a comunidade no painel admin.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION aceitar_convite_socio(p_evento_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_socio RECORD;
  v_ev RECORD;
  v_todos_aceitos BOOLEAN;
  v_comunidade_id UUID;
BEGIN
  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  IF v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Convite ja respondido');
  END IF;

  -- Registrar no histórico
  UPDATE socios_evento SET
    status = 'ACEITO',
    prazo_resposta = NULL,
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', COALESCE(rodada_negociacao, 1),
      'de', 'socio',
      'acao', 'aceitar',
      'percentual', split_percentual,
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Verificar se TODOS os socios aceitaram
  SELECT NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND status != 'ACEITO'
  ) INTO v_todos_aceitos;

  -- Se todos aceitaram, evento vai pra PUBLICADO
  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'PUBLICADO', publicado = true WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by, comunidade_id INTO v_ev FROM eventos_admin WHERE id = p_evento_id;
  v_comunidade_id := v_ev.comunidade_id;

  -- ══ Auto-criar RBAC do sócio no EVENTO ══
  INSERT INTO atribuicoes_rbac (user_id, tenant_type, tenant_id, cargo, permissoes, atribuido_por, ativo)
  VALUES (
    v_caller,
    'EVENTO',
    p_evento_id,
    'SOCIO',
    ARRAY['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'VENDER_PORTA'],
    v_ev.created_by,
    true
  )
  ON CONFLICT DO NOTHING;

  -- ══ Auto-criar RBAC do sócio na COMUNIDADE (para aparecer no gateway) ══
  IF v_comunidade_id IS NOT NULL THEN
    INSERT INTO atribuicoes_rbac (user_id, tenant_type, tenant_id, cargo, permissoes, atribuido_por, ativo)
    VALUES (
      v_caller,
      'COMUNIDADE',
      v_comunidade_id,
      'SOCIO',
      ARRAY['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'VENDER_PORTA'],
      v_ev.created_by,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by, 'todos_aceitos', v_todos_aceitos);
END;
$$;

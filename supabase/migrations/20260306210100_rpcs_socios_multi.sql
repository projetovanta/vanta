-- Migration: Atualizar RPCs de convite socio para usar socios_evento (multi-socio)

-- ── get_convite_socio — agora busca de socios_evento ──────────────
CREATE OR REPLACE FUNCTION get_convite_socio(p_evento_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_caller UUID := auth.uid();
BEGIN
  -- Valida que o caller eh socio deste evento
  IF NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND socio_id = v_caller
  ) THEN
    RETURN json_build_object('error', 'not_authorized');
  END IF;

  SELECT json_build_object(
    'id', e.id,
    'nome', e.nome,
    'foto', e.foto,
    'descricao', e.descricao,
    'data_inicio', e.data_inicio,
    'local', e.local,
    'cidade', e.cidade,
    'comunidade_id', e.comunidade_id,
    'comunidade_nome', COALESCE(c.nome, ''),
    'criador_nome', COALESCE(p.full_name, p.nome, 'Produtor'),
    'split_socio', s.split_percentual,
    'split_produtor', 100 - COALESCE((
      SELECT SUM(split_percentual) FROM socios_evento WHERE evento_id = p_evento_id
    ), 0),
    'permissoes_produtor', COALESCE(e.permissoes_produtor, '{}'),
    'rodada_negociacao', COALESCE(s.rodada_negociacao, 1),
    'mensagem_negociacao', s.mensagem_negociacao,
    'status_evento', e.status_evento,
    'socio_convidado_id', s.socio_id,
    'socios', COALESCE((
      SELECT json_agg(json_build_object(
        'socio_id', se.socio_id,
        'split_percentual', se.split_percentual,
        'status', se.status,
        'nome', COALESCE(sp.full_name, sp.nome, '')
      ))
      FROM socios_evento se
      LEFT JOIN profiles sp ON sp.id = se.socio_id
      WHERE se.evento_id = p_evento_id
    ), '[]'::json)
  )
  INTO v_result
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  LEFT JOIN profiles p ON p.id = e.created_by
  LEFT JOIN socios_evento s ON s.evento_id = e.id AND s.socio_id = v_caller
  WHERE e.id = p_evento_id;

  RETURN COALESCE(v_result, json_build_object('error', 'not_found'));
END;
$$;

-- ── aceitar_convite_socio — agora atualiza socios_evento ──────────
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
BEGIN
  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  IF v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Convite ja respondido');
  END IF;

  UPDATE socios_evento SET status = 'ACEITO', updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Verificar se TODOS os socios aceitaram
  SELECT NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND status != 'ACEITO'
  ) INTO v_todos_aceitos;

  -- Se todos aceitaram, evento vai pra PENDENTE (pronto pra publicar)
  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'PENDENTE' WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by, 'todos_aceitos', v_todos_aceitos);
END;
$$;

-- ── recusar_convite_socio — agora atualiza socios_evento ──────────
CREATE OR REPLACE FUNCTION recusar_convite_socio(p_evento_id UUID, p_motivo TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_socio RECORD;
  v_ev RECORD;
  v_rodada INT;
  v_definitivo BOOLEAN;
BEGIN
  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'definitivo', false, 'erro', 'Nao autorizado');
  END IF;

  v_rodada := COALESCE(v_socio.rodada_negociacao, 1);
  v_definitivo := v_rodada >= 3;

  UPDATE socios_evento SET
    status = 'RECUSADO',
    motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou o convite'),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  -- Se definitivo (3 rodadas), cancela evento
  IF v_definitivo THEN
    UPDATE eventos_admin SET
      status_evento = 'CANCELADO',
      motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou o convite (3 tentativas)')
    WHERE id = p_evento_id;
  ELSE
    UPDATE eventos_admin SET
      status_evento = 'RASCUNHO',
      motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou — aguardando nova proposta')
    WHERE id = p_evento_id;
  END IF;

  RETURN json_build_object(
    'ok', true,
    'definitivo', v_definitivo,
    'rodada', v_rodada,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by
  );
END;
$$;

-- ── contraproposta_convite_socio — agora atualiza socios_evento ───
CREATE OR REPLACE FUNCTION contraproposta_convite_socio(
  p_evento_id UUID,
  p_split_socio INT,
  p_split_produtor INT,
  p_permissoes_produtor TEXT[] DEFAULT NULL,
  p_mensagem TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_socio RECORD;
  v_ev RECORD;
  v_rodada_atual INT;
  v_nova_rodada INT;
BEGIN
  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  IF v_socio.status != 'NEGOCIANDO' THEN
    RETURN json_build_object('ok', false, 'erro', 'Convite nao esta em negociacao');
  END IF;

  v_rodada_atual := COALESCE(v_socio.rodada_negociacao, 1);
  IF v_rodada_atual >= 3 THEN
    RETURN json_build_object('ok', false, 'erro', 'Limite de 3 rodadas atingido');
  END IF;

  v_nova_rodada := v_rodada_atual + 1;

  UPDATE socios_evento SET
    split_percentual = p_split_socio,
    rodada_negociacao = v_nova_rodada,
    mensagem_negociacao = p_mensagem,
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Atualizar permissoes do produtor no evento
  IF p_permissoes_produtor IS NOT NULL THEN
    UPDATE eventos_admin SET permissoes_produtor = p_permissoes_produtor WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'nova_rodada', v_nova_rodada,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by
  );
END;
$$;

-- Re-grant (funcoes foram recriadas)
GRANT EXECUTE ON FUNCTION get_convite_socio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION aceitar_convite_socio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recusar_convite_socio(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION contraproposta_convite_socio(UUID, INT, INT, TEXT[], TEXT) TO authenticated;

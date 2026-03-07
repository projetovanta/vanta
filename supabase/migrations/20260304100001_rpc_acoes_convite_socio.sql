-- RPCs para ações do sócio convidado (aceitar, recusar, contra-proposta).
-- Todas SECURITY DEFINER — validam que caller = socio_convidado_id.

-- ── Aceitar Convite ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION aceitar_convite_socio(p_evento_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_ev RECORD;
BEGIN
  SELECT id, socio_convidado_id, status_evento, nome, created_by
  INTO v_ev
  FROM eventos_admin
  WHERE id = p_evento_id;

  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  IF v_ev.socio_convidado_id != v_caller THEN
    RETURN json_build_object('ok', false, 'erro', 'Não autorizado');
  END IF;

  IF v_ev.status_evento != 'NEGOCIANDO' THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não está em negociação');
  END IF;

  UPDATE eventos_admin SET status_evento = 'PENDENTE' WHERE id = p_evento_id;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by);
END;
$$;

-- ── Recusar Convite ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION recusar_convite_socio(p_evento_id UUID, p_motivo TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_ev RECORD;
  v_rodada INT;
  v_definitivo BOOLEAN;
BEGIN
  SELECT id, socio_convidado_id, status_evento, rodada_negociacao, nome, created_by
  INTO v_ev
  FROM eventos_admin
  WHERE id = p_evento_id;

  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'definitivo', false, 'erro', 'Evento não encontrado');
  END IF;

  IF v_ev.socio_convidado_id != v_caller THEN
    RETURN json_build_object('ok', false, 'definitivo', false, 'erro', 'Não autorizado');
  END IF;

  v_rodada := COALESCE(v_ev.rodada_negociacao, 1);
  v_definitivo := v_rodada >= 3;

  IF v_definitivo THEN
    UPDATE eventos_admin SET
      status_evento = 'CANCELADO',
      motivo_rejeicao = COALESCE(p_motivo, 'Sócio recusou o convite (3 tentativas)')
    WHERE id = p_evento_id;
  ELSE
    UPDATE eventos_admin SET
      status_evento = 'RASCUNHO',
      motivo_rejeicao = COALESCE(p_motivo, 'Sócio recusou — aguardando nova proposta')
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

-- ── Contra-Proposta ─────────────────────────────────────────────
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
  v_ev RECORD;
  v_rodada_atual INT;
  v_nova_rodada INT;
BEGIN
  SELECT id, socio_convidado_id, status_evento, rodada_negociacao, nome, created_by
  INTO v_ev
  FROM eventos_admin
  WHERE id = p_evento_id;

  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não encontrado');
  END IF;

  IF v_ev.socio_convidado_id != v_caller THEN
    RETURN json_build_object('ok', false, 'erro', 'Não autorizado');
  END IF;

  IF v_ev.status_evento != 'NEGOCIANDO' THEN
    RETURN json_build_object('ok', false, 'erro', 'Evento não está em negociação');
  END IF;

  v_rodada_atual := COALESCE(v_ev.rodada_negociacao, 1);
  IF v_rodada_atual >= 3 THEN
    RETURN json_build_object('ok', false, 'erro', 'Limite de 3 rodadas atingido');
  END IF;

  v_nova_rodada := v_rodada_atual + 1;

  UPDATE eventos_admin SET
    status_evento = 'NEGOCIANDO',
    rodada_negociacao = v_nova_rodada,
    split_produtor = p_split_produtor,
    split_socio = p_split_socio,
    mensagem_negociacao = p_mensagem,
    permissoes_produtor = COALESCE(p_permissoes_produtor, permissoes_produtor)
  WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'nova_rodada', v_nova_rodada,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by
  );
END;
$$;

GRANT EXECUTE ON FUNCTION aceitar_convite_socio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION recusar_convite_socio(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION contraproposta_convite_socio(UUID, INT, INT, TEXT[], TEXT) TO authenticated;

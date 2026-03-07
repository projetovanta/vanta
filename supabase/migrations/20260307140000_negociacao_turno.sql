-- ═══════════════════════════════════════════════════════════════
-- Negociação sócio-produtor: turno alternado, histórico, prazo 48h
-- ═══════════════════════════════════════════════════════════════

-- 1. Remover constraint antiga de status e adicionar novos
ALTER TABLE socios_evento DROP CONSTRAINT IF EXISTS chk_socios_status;
ALTER TABLE socios_evento ADD CONSTRAINT chk_socios_status
  CHECK (status IN ('PENDENTE', 'NEGOCIANDO', 'ACEITO', 'RECUSADO', 'CANCELADO', 'EXPIRADO'));

-- 2. Novas colunas
ALTER TABLE socios_evento
  ADD COLUMN IF NOT EXISTS ultimo_turno TEXT DEFAULT 'produtor'
    CHECK (ultimo_turno IN ('produtor', 'socio')),
  ADD COLUMN IF NOT EXISTS prazo_resposta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS historico_propostas JSONB DEFAULT '[]'::jsonb;

-- Comentários
COMMENT ON COLUMN socios_evento.ultimo_turno IS 'Quem fez a última proposta: produtor ou socio';
COMMENT ON COLUMN socios_evento.prazo_resposta IS 'Data limite para o outro lado responder (48h)';
COMMENT ON COLUMN socios_evento.historico_propostas IS 'Array de propostas: [{rodada, de, percentual, mensagem, created_at}]';

-- ═══════════════════════════════════════════════════════════════
-- get_convite_socio — inclui novos campos
-- ═══════════════════════════════════════════════════════════════
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
    'ultimo_turno', COALESCE(s.ultimo_turno, 'produtor'),
    'prazo_resposta', s.prazo_resposta,
    'historico_propostas', COALESCE(s.historico_propostas, '[]'::jsonb),
    'status', s.status,
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

-- ═══════════════════════════════════════════════════════════════
-- aceitar_convite_socio — agora publica automaticamente
-- ═══════════════════════════════════════════════════════════════
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

  -- Se todos aceitaram, evento vai pra PUBLICADO (decisão do usuário)
  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'PUBLICADO', publicado = true WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by, 'todos_aceitos', v_todos_aceitos);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- recusar_convite_socio — ambos podem recusar, com histórico
-- ═══════════════════════════════════════════════════════════════
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
BEGIN
  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  IF v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Convite ja respondido');
  END IF;

  UPDATE socios_evento SET
    status = 'RECUSADO',
    motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou o convite'),
    prazo_resposta = NULL,
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', COALESCE(rodada_negociacao, 1),
      'de', 'socio',
      'acao', 'recusar',
      'mensagem', COALESCE(p_motivo, ''),
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Evento volta pra RASCUNHO (produtor pode reiniciar ou trocar sócio)
  UPDATE eventos_admin SET
    status_evento = 'RASCUNHO',
    motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou')
  WHERE id = p_evento_id;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by,
    'rodada', COALESCE(v_socio.rodada_negociacao, 1)
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- contraproposta_convite_socio — registra no histórico + turno + prazo 48h
-- ═══════════════════════════════════════════════════════════════
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

  IF v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Convite nao esta em negociacao');
  END IF;

  v_rodada_atual := COALESCE(v_socio.rodada_negociacao, 1);
  IF v_rodada_atual >= 3 THEN
    RETURN json_build_object('ok', false, 'erro', 'Limite de 3 rodadas atingido');
  END IF;

  v_nova_rodada := v_rodada_atual + 1;

  UPDATE socios_evento SET
    split_percentual = p_split_socio,
    status = 'NEGOCIANDO',
    rodada_negociacao = v_nova_rodada,
    mensagem_negociacao = p_mensagem,
    ultimo_turno = 'socio',
    prazo_resposta = now() + INTERVAL '48 hours',
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', v_nova_rodada,
      'de', 'socio',
      'acao', 'contraproposta',
      'percentual', p_split_socio,
      'mensagem', COALESCE(p_mensagem, ''),
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Atualizar permissoes do produtor no evento
  IF p_permissoes_produtor IS NOT NULL THEN
    UPDATE eventos_admin SET permissoes_produtor = p_permissoes_produtor WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by,
    'rodada', v_nova_rodada
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- contraproposta_produtor — produtor responde ao sócio (NOVA RPC)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION contraproposta_produtor(
  p_evento_id UUID,
  p_socio_id UUID,
  p_split_socio INT,
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
  -- Verificar que o caller é o criador do evento
  SELECT * INTO v_ev FROM eventos_admin WHERE id = p_evento_id AND created_by = v_caller;
  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Socio nao encontrado');
  END IF;

  IF v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Negociacao encerrada');
  END IF;

  -- Verificar que é a vez do produtor (último turno foi do sócio)
  IF v_socio.ultimo_turno = 'produtor' AND v_socio.status = 'NEGOCIANDO' THEN
    RETURN json_build_object('ok', false, 'erro', 'Aguardando resposta do socio');
  END IF;

  v_rodada_atual := COALESCE(v_socio.rodada_negociacao, 1);
  IF v_rodada_atual >= 3 THEN
    RETURN json_build_object('ok', false, 'erro', 'Limite de 3 rodadas atingido');
  END IF;

  v_nova_rodada := v_rodada_atual + 1;

  UPDATE socios_evento SET
    split_percentual = p_split_socio,
    status = 'NEGOCIANDO',
    rodada_negociacao = v_nova_rodada,
    mensagem_negociacao = p_mensagem,
    ultimo_turno = 'produtor',
    prazo_resposta = now() + INTERVAL '48 hours',
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', v_nova_rodada,
      'de', 'produtor',
      'acao', 'contraproposta',
      'percentual', p_split_socio,
      'mensagem', COALESCE(p_mensagem, ''),
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  RETURN json_build_object(
    'ok', true,
    'nome', v_ev.nome,
    'rodada', v_nova_rodada
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- aceitar_proposta_produtor — produtor aceita contraproposta do sócio (NOVA RPC)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION aceitar_proposta_produtor(
  p_evento_id UUID,
  p_socio_id UUID
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
  v_todos_aceitos BOOLEAN;
BEGIN
  SELECT * INTO v_ev FROM eventos_admin WHERE id = p_evento_id AND created_by = v_caller;
  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  IF v_socio IS NULL OR v_socio.status NOT IN ('PENDENTE', 'NEGOCIANDO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Negociacao encerrada');
  END IF;

  UPDATE socios_evento SET
    status = 'ACEITO',
    prazo_resposta = NULL,
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', COALESCE(rodada_negociacao, 1),
      'de', 'produtor',
      'acao', 'aceitar',
      'percentual', split_percentual,
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  -- Verificar se TODOS os sócios aceitaram → publicar
  SELECT NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND status != 'ACEITO'
  ) INTO v_todos_aceitos;

  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'PUBLICADO', publicado = true WHERE id = p_evento_id;
  END IF;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'todos_aceitos', v_todos_aceitos);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- cancelar_convite_produtor — produtor desiste (NOVA RPC)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cancelar_convite_produtor(
  p_evento_id UUID,
  p_socio_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_ev RECORD;
BEGIN
  SELECT * INTO v_ev FROM eventos_admin WHERE id = p_evento_id AND created_by = v_caller;
  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  UPDATE socios_evento SET
    status = 'CANCELADO',
    motivo_rejeicao = COALESCE(p_motivo, 'Produtor cancelou o convite'),
    prazo_resposta = NULL,
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', COALESCE(rodada_negociacao, 1),
      'de', 'produtor',
      'acao', 'cancelar',
      'mensagem', COALESCE(p_motivo, ''),
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id
    AND status IN ('PENDENTE', 'NEGOCIANDO');

  -- Evento volta pra RASCUNHO
  UPDATE eventos_admin SET status_evento = 'RASCUNHO' WHERE id = p_evento_id;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- reiniciar_negociacao — produtor reinicia com mesmo sócio (NOVA RPC)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION reiniciar_negociacao(
  p_evento_id UUID,
  p_socio_id UUID,
  p_split_socio INT,
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
  v_socio RECORD;
BEGIN
  SELECT * INTO v_ev FROM eventos_admin WHERE id = p_evento_id AND created_by = v_caller;
  IF v_ev IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Nao autorizado');
  END IF;

  SELECT * INTO v_socio FROM socios_evento
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  IF v_socio IS NULL THEN
    RETURN json_build_object('ok', false, 'erro', 'Socio nao encontrado');
  END IF;

  IF v_socio.status NOT IN ('RECUSADO', 'CANCELADO', 'EXPIRADO') THEN
    RETURN json_build_object('ok', false, 'erro', 'Negociacao ainda ativa');
  END IF;

  UPDATE socios_evento SET
    status = 'PENDENTE',
    split_percentual = p_split_socio,
    rodada_negociacao = 1,
    ultimo_turno = 'produtor',
    prazo_resposta = now() + INTERVAL '48 hours',
    mensagem_negociacao = p_mensagem,
    motivo_rejeicao = NULL,
    historico_propostas = jsonb_build_array(jsonb_build_object(
      'rodada', 1,
      'de', 'produtor',
      'acao', 'proposta',
      'percentual', p_split_socio,
      'mensagem', COALESCE(p_mensagem, ''),
      'created_at', now()
    )),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = p_socio_id;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- Expirar negociações vencidas (chamado por cron ou edge function)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION expirar_negociacoes_vencidas()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  WITH expirados AS (
    UPDATE socios_evento SET
      status = 'EXPIRADO',
      prazo_resposta = NULL,
      historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
        'rodada', COALESCE(rodada_negociacao, 1),
        'de', 'sistema',
        'acao', 'expirar',
        'created_at', now()
      ),
      updated_at = now()
    WHERE status IN ('PENDENTE', 'NEGOCIANDO')
      AND prazo_resposta IS NOT NULL
      AND prazo_resposta < now()
    RETURNING evento_id
  )
  UPDATE eventos_admin SET
    status_evento = 'RASCUNHO',
    motivo_rejeicao = 'Prazo de resposta expirado'
  WHERE id IN (SELECT evento_id FROM expirados);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Notificar PostgREST sobre mudanças de schema
NOTIFY pgrst, 'reload schema';

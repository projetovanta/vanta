-- ══════════════════════════════════════════════════════════════════════════════
-- Fix: PUBLICADO → ATIVO nas RPCs + adicionar EM_REVISAO ao CHECK constraint
--
-- Bug 1: aceitar_convite_socio e aceitar_proposta_produtor gravavam 'PUBLICADO'
--         que NÃO existe no CHECK → aceitação de sócio falhava silenciosamente
-- Bug 2: eventosAdminAprovacao.ts grava 'EM_REVISAO' na rejeição parcial
--         mas EM_REVISAO não existia no CHECK → rejeição falhava
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Atualizar CHECK constraint para incluir EM_REVISAO
ALTER TABLE eventos_admin DROP CONSTRAINT IF EXISTS chk_status_evento;
ALTER TABLE eventos_admin ADD CONSTRAINT chk_status_evento
  CHECK (status_evento IS NULL OR status_evento IN (
    'RASCUNHO', 'PENDENTE', 'NEGOCIANDO', 'EM_REVISAO', 'ATIVO', 'EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'
  ));

-- 2. Corrigir aceitar_convite_socio: PUBLICADO → ATIVO
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

  UPDATE socios_evento SET
    status = 'ACEITO',
    prazo_resposta = NULL,
    historico_propostas = COALESCE(historico_propostas, '[]'::jsonb) || jsonb_build_object(
      'rodada', COALESCE(rodada_negociacao, 1),
      'de', 'socio',
      'acao', 'aceitar',
      'mensagem', '',
      'created_at', now()
    ),
    updated_at = now()
  WHERE evento_id = p_evento_id AND socio_id = v_caller;

  -- Verificar se TODOS os sócios aceitaram
  SELECT NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND status != 'ACEITO'
  ) INTO v_todos_aceitos;

  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'ATIVO', publicado = true WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  -- Auto-criar RBAC do sócio no EVENTO com permissões corretas
  INSERT INTO atribuicoes_rbac (user_id, tenant_type, tenant_id, cargo, permissoes, atribuido_por, ativo)
  VALUES (
    v_caller,
    'EVENTO',
    p_evento_id,
    'SOCIO',
    ARRAY['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'INSERIR_LISTA', 'CRIAR_REGRA_LISTA', 'VER_LISTA'],
    v_ev.created_by,
    true
  )
  ON CONFLICT DO NOTHING;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by, 'todos_aceitos', v_todos_aceitos);
END;
$$;

GRANT EXECUTE ON FUNCTION aceitar_convite_socio(UUID) TO authenticated;

-- 3. Corrigir aceitar_proposta_produtor: PUBLICADO → ATIVO
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

  -- Verificar se TODOS os sócios aceitaram
  SELECT NOT EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND status != 'ACEITO'
  ) INTO v_todos_aceitos;

  IF v_todos_aceitos THEN
    UPDATE eventos_admin SET status_evento = 'ATIVO', publicado = true WHERE id = p_evento_id;
  END IF;

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'todos_aceitos', v_todos_aceitos);
END;
$$;

GRANT EXECUTE ON FUNCTION aceitar_proposta_produtor(UUID, UUID) TO authenticated;

-- 4. Corrigir eventuais eventos presos em PUBLICADO (dados legados)
UPDATE eventos_admin SET status_evento = 'ATIVO' WHERE status_evento = 'PUBLICADO';

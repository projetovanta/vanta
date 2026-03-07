-- ══════════════════════════════════════════════════════════════════════
-- Migration: Cargos por nível correto
-- GERENTE = só COMUNIDADE
-- SOCIO, PROMOTER, PORTARIA*, CAIXA = só EVENTO
-- aceitar_convite_socio não cria mais RBAC na COMUNIDADE
-- ══════════════════════════════════════════════════════════════════════

-- 1. Limpar dados espúrios: SOCIO em COMUNIDADE, GERENTE em EVENTO
DELETE FROM atribuicoes_rbac WHERE tenant_type = 'COMUNIDADE' AND cargo = 'SOCIO';
DELETE FROM atribuicoes_rbac WHERE tenant_type = 'EVENTO' AND cargo = 'GERENTE';

-- 2. Limpar RBAC de eventos CANCELADOS
DELETE FROM atribuicoes_rbac ar
USING eventos_admin ea
WHERE ar.tenant_type = 'EVENTO'
  AND ar.tenant_id = ea.id
  AND ea.status_evento = 'CANCELADO';

-- 3. Atualizar aceitar_convite_socio — NÃO cria mais RBAC na COMUNIDADE
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
    UPDATE eventos_admin SET status_evento = 'PUBLICADO', publicado = true WHERE id = p_evento_id;
  END IF;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  -- Auto-criar RBAC do sócio no EVENTO (SOCIO só existe em EVENTO)
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

  RETURN json_build_object('ok', true, 'nome', v_ev.nome, 'criador_id', v_ev.created_by, 'todos_aceitos', v_todos_aceitos);
END;
$$;

GRANT EXECUTE ON FUNCTION aceitar_convite_socio(UUID) TO authenticated;

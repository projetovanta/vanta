-- ══════════════════════════════════════════════════════════════════════
-- Migration: Fix RBAC GERENTE em EVENTO + Recusa remove RBAC
-- ══════════════════════════════════════════════════════════════════════

-- 1. Remover todos os RBAC GERENTE no nivel EVENTO (cargo GERENTE so existe em COMUNIDADE)
DELETE FROM atribuicoes_rbac
WHERE tenant_type = 'EVENTO' AND cargo = 'GERENTE';

-- 2. Atualizar recusar_convite_socio para remover RBAC do evento ao recusar
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

  -- Remover RBAC do socio neste evento (qualquer cargo)
  DELETE FROM atribuicoes_rbac
  WHERE user_id = v_caller
    AND tenant_type = 'EVENTO'
    AND tenant_id = p_evento_id;

  -- Evento volta pra RASCUNHO (produtor pode reiniciar ou trocar socio)
  UPDATE eventos_admin SET
    status_evento = 'RASCUNHO',
    motivo_rejeicao = COALESCE(p_motivo, 'Socio recusou')
  WHERE id = p_evento_id;

  SELECT nome, created_by INTO v_ev FROM eventos_admin WHERE id = p_evento_id;

  RETURN json_build_object(
    'ok', true,
    'nome', v_ev.nome,
    'criador_id', v_ev.created_by,
    'socio_id', v_caller
  );
END;
$$;

GRANT EXECUTE ON FUNCTION recusar_convite_socio(UUID, TEXT) TO authenticated;

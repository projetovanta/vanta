-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Corrigir permissões SOCIO no RBAC
-- SOCIO = VER_FINANCEIRO, GERIR_EQUIPE, GERIR_LISTAS, INSERIR_LISTA, CRIAR_REGRA_LISTA, VER_LISTA
-- Remove VENDER_PORTA e VALIDAR_ENTRADA de SOCIO
-- Atualiza RPC aceitar_convite_socio com permissões corretas
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Atualizar registros RBAC existentes de SOCIO com permissões corretas
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'INSERIR_LISTA', 'CRIAR_REGRA_LISTA', 'VER_LISTA']
WHERE cargo = 'SOCIO'
  AND tenant_type = 'EVENTO'
  AND ativo = true;

-- 2. Atualizar registros RBAC existentes de GERENTE com permissões corretas
UPDATE atribuicoes_rbac
SET permissoes = ARRAY['VER_FINANCEIRO', 'GERIR_EQUIPE', 'GERIR_LISTAS', 'INSERIR_LISTA', 'CRIAR_REGRA_LISTA', 'VER_LISTA', 'CHECKIN_LISTA', 'VALIDAR_QR', 'VALIDAR_ENTRADA']
WHERE cargo = 'GERENTE'
  AND tenant_type = 'COMUNIDADE'
  AND ativo = true;

-- 3. Atualizar RPC aceitar_convite_socio com permissões SOCIO corretas
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

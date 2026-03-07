-- ══════════════════════════════════════════════════════════════════════════════
-- RPC get_admin_access — 1 fonte de verdade para o gate do painel admin
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Retorna JSON com:
--   role: role do user em profiles
--   comunidades: [{id, nome, foto, cargo, direto}]
--   eventos: [{id, nome, foto, comunidade_id, cargo}]
--
-- masteradm → todas comunidades + todos eventos
-- cargo em comunidade → direto:true, eventos daquela comunidade inclusos
-- cargo só em evento → comunidade aparece com direto:false
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_admin_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_is_master BOOLEAN;
  v_comunidades JSONB;
  v_eventos JSONB;
  v_com_ids_direto UUID[];
BEGIN
  -- 1. Role do user
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
  v_is_master := (v_role = 'vanta_masteradm');

  IF v_is_master THEN
    -- Master → todas comunidades com direto:true, todos eventos
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', c.id,
      'nome', c.nome,
      'foto', c.foto,
      'cargo', 'GERENTE',
      'direto', true
    ) ORDER BY c.nome), '[]'::jsonb)
    INTO v_comunidades
    FROM comunidades c
    WHERE c.ativa = true;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', e.id,
      'nome', e.nome,
      'foto', e.foto,
      'comunidade_id', e.comunidade_id,
      'cargo', 'GERENTE'
    ) ORDER BY e.nome), '[]'::jsonb)
    INTO v_eventos
    FROM eventos_admin e;

  ELSE
    -- Comunidades com cargo DIRETO
    SELECT COALESCE(array_agg(a.tenant_id), ARRAY[]::UUID[])
    INTO v_com_ids_direto
    FROM atribuicoes_rbac a
    WHERE a.user_id = p_user_id
      AND a.ativo = true
      AND a.tenant_type = 'COMUNIDADE';

    -- Comunidades: diretas + indiretas (via evento)
    SELECT COALESCE(jsonb_agg(row_data ORDER BY row_data->>'nome'), '[]'::jsonb)
    INTO v_comunidades
    FROM (
      -- Comunidades com cargo direto
      SELECT DISTINCT jsonb_build_object(
        'id', c.id,
        'nome', c.nome,
        'foto', c.foto,
        'cargo', a.cargo,
        'direto', true
      ) AS row_data
      FROM atribuicoes_rbac a
      JOIN comunidades c ON c.id = a.tenant_id
      WHERE a.user_id = p_user_id
        AND a.ativo = true
        AND a.tenant_type = 'COMUNIDADE'
        AND c.ativa = true

      UNION

      -- Comunidades via evento (indireto)
      SELECT DISTINCT jsonb_build_object(
        'id', c.id,
        'nome', c.nome,
        'foto', c.foto,
        'cargo', a.cargo,
        'direto', false
      ) AS row_data
      FROM atribuicoes_rbac a
      JOIN eventos_admin e ON e.id = a.tenant_id
      JOIN comunidades c ON c.id = e.comunidade_id
      WHERE a.user_id = p_user_id
        AND a.ativo = true
        AND a.tenant_type = 'EVENTO'
        AND c.ativa = true
        AND e.comunidade_id != ALL(v_com_ids_direto)
    ) sub;

    -- Eventos: onde tem cargo direto + eventos das comunidades diretas
    SELECT COALESCE(jsonb_agg(row_data ORDER BY row_data->>'nome'), '[]'::jsonb)
    INTO v_eventos
    FROM (
      -- Eventos com cargo direto
      SELECT DISTINCT jsonb_build_object(
        'id', e.id,
        'nome', e.nome,
        'foto', e.foto,
        'comunidade_id', e.comunidade_id,
        'cargo', a.cargo
      ) AS row_data
      FROM atribuicoes_rbac a
      JOIN eventos_admin e ON e.id = a.tenant_id
      WHERE a.user_id = p_user_id
        AND a.ativo = true
        AND a.tenant_type = 'EVENTO'

      UNION

      -- Eventos das comunidades onde tem cargo direto
      SELECT DISTINCT jsonb_build_object(
        'id', e.id,
        'nome', e.nome,
        'foto', e.foto,
        'comunidade_id', e.comunidade_id,
        'cargo', a.cargo
      ) AS row_data
      FROM atribuicoes_rbac a
      JOIN eventos_admin e ON e.comunidade_id = a.tenant_id
      WHERE a.user_id = p_user_id
        AND a.ativo = true
        AND a.tenant_type = 'COMUNIDADE'
    ) sub;

  END IF;

  RETURN jsonb_build_object(
    'role', v_role,
    'comunidades', v_comunidades,
    'eventos', v_eventos
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RLS Privacidade entre Eventos
-- ══════════════════════════════════════════════════════════════════════════════
-- Regras:
--   Master: ve tudo
--   Gerente da comunidade: ve todos os eventos da comunidade
--   Socio: so ve eventos onde e socio
--   Equipe operacional: so ve o evento onde foi escalado
--   Promoter: so ve eventos onde e promoter
--   Sem permissao: evento invisivel
--
-- Tabelas afetadas: eventos_admin, lotes, variacoes_ingresso, equipe_evento
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Helper: has_evento_access ───────────────────────────────────────────────
-- Retorna TRUE se auth.uid() pode ver o evento p_evento_id
CREATE OR REPLACE FUNCTION has_evento_access(p_evento_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_comunidade_id UUID;
BEGIN
  IF v_uid IS NULL THEN RETURN FALSE; END IF;

  -- 1. Master ve tudo
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_uid AND role = 'vanta_masteradm') THEN
    RETURN TRUE;
  END IF;

  -- Buscar comunidade do evento
  SELECT comunidade_id INTO v_comunidade_id FROM eventos_admin WHERE id = p_evento_id;

  -- 2. Gerente da comunidade (RBAC direto na comunidade com cargo GERENTE)
  IF v_comunidade_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM atribuicoes_rbac
    WHERE user_id = v_uid AND tenant_type = 'COMUNIDADE' AND tenant_id = v_comunidade_id
      AND cargo = 'GERENTE' AND ativo = true
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Criador do evento
  IF EXISTS (SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND created_by = v_uid) THEN
    RETURN TRUE;
  END IF;

  -- 4. RBAC direto no evento (qualquer cargo: SOCIO, GERENTE, PROMOTER, CAIXA, PORTARIA, etc)
  IF EXISTS (
    SELECT 1 FROM atribuicoes_rbac
    WHERE user_id = v_uid AND tenant_type = 'EVENTO' AND tenant_id = p_evento_id AND ativo = true
  ) THEN
    RETURN TRUE;
  END IF;

  -- 5. Socio do evento (via socios_evento)
  IF EXISTS (
    SELECT 1 FROM socios_evento
    WHERE evento_id = p_evento_id AND socio_id = v_uid AND status IN ('PENDENTE', 'NEGOCIANDO', 'ACEITO')
  ) THEN
    RETURN TRUE;
  END IF;

  -- 6. Membro da equipe operacional (equipe_evento)
  IF EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id AND membro_id = v_uid
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- EVENTOS_ADMIN — remover policy aberta, restringir
-- ══════════════════════════════════════════════════════════════════════════════

-- Remover a policy aberta (true)
DROP POLICY IF EXISTS "eventos_admin_select" ON eventos_admin;

-- Remover policies redundantes (serao substituidas por has_evento_access)
DROP POLICY IF EXISTS "eventos_select_creator" ON eventos_admin;
DROP POLICY IF EXISTS "eventos_select_team" ON eventos_admin;
DROP POLICY IF EXISTS "eventos_select_admin" ON eventos_admin;
DROP POLICY IF EXISTS "eventos_admin: produtor da comunidade" ON eventos_admin;

-- Remover eventos_select_published (sera absorvida pela nova policy)
DROP POLICY IF EXISTS "eventos_select_published" ON eventos_admin;
-- Manter: eventos_admin: masteradm full access (master ALL)

-- Nova policy: no painel admin, so ve eventos com acesso
CREATE POLICY "eventos_select_with_access" ON eventos_admin
  FOR SELECT USING (
    publicado = true  -- eventos publicados sao visiveis pra todos (app/site/checkout)
    OR has_evento_access(id)
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- LOTES — remover policy aberta, restringir
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "lotes_select" ON lotes;

CREATE POLICY "lotes_select_with_access" ON lotes
  FOR SELECT USING (
    -- Lotes de eventos publicados sao visiveis (checkout precisa)
    EXISTS (SELECT 1 FROM eventos_admin WHERE id = lotes.evento_id AND publicado = true)
    OR has_evento_access(evento_id)
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- VARIACOES_INGRESSO — remover policy aberta, restringir
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "variacoes_ingresso_select" ON variacoes_ingresso;

CREATE POLICY "variacoes_select_with_access" ON variacoes_ingresso
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lotes l
      JOIN eventos_admin e ON e.id = l.evento_id
      WHERE l.id = variacoes_ingresso.lote_id AND e.publicado = true
    )
    OR EXISTS (
      SELECT 1 FROM lotes l
      WHERE l.id = variacoes_ingresso.lote_id AND has_evento_access(l.evento_id)
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- EQUIPE_EVENTO — restringir leitura
-- ══════════════════════════════════════════════════════════════════════════════

-- Remover policies abertas/redundantes
DROP POLICY IF EXISTS "equipe_evento: leitura autenticado" ON equipe_evento;
DROP POLICY IF EXISTS "equipe_evento: leitura por membro ou sócio" ON equipe_evento;

-- Nova policy unica: has_evento_access cobre todos os casos
CREATE POLICY "equipe_evento: leitura com acesso" ON equipe_evento
  FOR SELECT USING (
    has_evento_access(evento_id)
  );

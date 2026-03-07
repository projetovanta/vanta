-- ============================================================
-- FIX: Carteira RLS Security Breaches
-- ============================================================

-- 1. TICKETS_CAIXA

DROP POLICY IF EXISTS "tickets_caixa_all" ON tickets_caixa;
DROP POLICY IF EXISTS "tickets_caixa_select" ON tickets_caixa;

CREATE POLICY "tickets_insert_owner"
  ON tickets_caixa FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "tickets_insert_team"
  ON tickets_caixa FOR INSERT
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

CREATE POLICY "tickets_update_team"
  ON tickets_caixa FOR UPDATE
  USING (is_event_team_member(evento_id) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

-- 2. CORTESIAS_PENDENTES

DROP POLICY IF EXISTS "Authenticated can insert cortesias" ON cortesias_pendentes;

CREATE POLICY "cortesias_insert_team"
  ON cortesias_pendentes FOR INSERT
  WITH CHECK (is_event_team_member(evento_id::uuid) OR is_vanta_admin());

-- 3. TRANSFERENCIAS_INGRESSO

DROP POLICY IF EXISTS "transf_update" ON transferencias_ingresso;
CREATE POLICY "transf_update"
  ON transferencias_ingresso FOR UPDATE
  USING (auth.uid() = destinatario_id)
  WITH CHECK (auth.uid() = destinatario_id);

-- 4. RPC: aceitar_cortesia_rpc (SECURITY DEFINER)

CREATE OR REPLACE FUNCTION aceitar_cortesia_rpc(p_cortesia_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cortesia cortesias_pendentes%ROWTYPE;
  v_ticket_id UUID;
  v_qr TEXT;
BEGIN
  SELECT * INTO v_cortesia
  FROM cortesias_pendentes
  WHERE id = p_cortesia_id
    AND destinatario_id = auth.uid()
    AND status = 'PENDENTE';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cortesia nao encontrada ou ja processada';
  END IF;

  UPDATE cortesias_pendentes
  SET status = 'ACEITO'
  WHERE id = p_cortesia_id;

  v_ticket_id := gen_random_uuid();
  v_qr := 'CORTESIA-' || upper(substr(md5(random()::text), 1, 8));

  INSERT INTO tickets_caixa (
    id, evento_id, variacao_id, email, owner_id,
    valor, status, nome_titular, origem, variacao_label
  ) VALUES (
    v_ticket_id,
    v_cortesia.evento_id::uuid,
    NULL,
    '',
    auth.uid(),
    0,
    'DISPONIVEL',
    COALESCE(v_cortesia.remetente_nome, ''),
    'CORTESIA',
    COALESCE(v_cortesia.variacao_label, '')
  );

  RETURN json_build_object(
    'id', v_ticket_id,
    'evento_id', v_cortesia.evento_id,
    'evento_nome', v_cortesia.evento_nome,
    'evento_data', v_cortesia.evento_data,
    'status', 'DISPONIVEL',
    'codigo_qr', v_qr,
    'variacao_label', v_cortesia.variacao_label,
    'tipo', 'CORTESIA'
  );
END;
$$;

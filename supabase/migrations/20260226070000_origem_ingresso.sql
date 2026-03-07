-- Migração: coluna origem em tickets_caixa e vendas_log
-- Valores: ANTECIPADO | PORTA | LISTA | CORTESIA

ALTER TABLE tickets_caixa
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'PORTA';

ALTER TABLE vendas_log
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'PORTA';

-- Atualizar RPC processar_venda_caixa para incluir origem = 'PORTA'
CREATE OR REPLACE FUNCTION processar_venda_caixa(
  p_evento_id   UUID,
  p_lote_id     UUID,
  p_variacao_id UUID,
  p_email       TEXT,
  p_valor_unit  NUMERIC,
  p_taxa        NUMERIC DEFAULT 0.05
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_ticket_id UUID;
  v_var       variacoes_ingresso%ROWTYPE;
  v_taxa      NUMERIC;
BEGIN
  -- Resolve taxa contratada
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;
  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

  -- Verifica disponibilidade
  SELECT * INTO v_var FROM variacoes_ingresso WHERE id = p_variacao_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Variação não encontrada.');
  END IF;
  IF v_var.vendidos >= v_var.limite THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  -- Verifica que o operador tem papel CAIXA no evento
  IF NOT EXISTS (
    SELECT 1 FROM equipe_evento
    WHERE evento_id = p_evento_id AND membro_id = auth.uid() AND papel = 'CAIXA'
  ) AND NOT is_masteradm() THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Sem permissão de caixa para este evento.');
  END IF;

  -- Verifica que o caixa está ativo
  IF NOT EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND caixa_ativo = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Caixa não está ativo para este evento.');
  END IF;

  -- Cria ticket com origem PORTA
  INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, valor, status, criado_por, origem)
  VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_valor_unit, 'DISPONIVEL', auth.uid(), 'PORTA')
  RETURNING id INTO v_ticket_id;

  -- Transação
  INSERT INTO transactions (evento_id, ticket_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
  VALUES (
    p_evento_id, v_ticket_id, p_email,
    p_valor_unit, ROUND(p_valor_unit * (1 - v_taxa), 2),
    v_taxa, 'CONCLUIDO', 'VENDA_CAIXA'
  );

  UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

  INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor, origem)
  VALUES (p_evento_id, p_variacao_id, CONCAT(v_var.area, ' · ', v_var.genero), p_valor_unit, 'PORTA');

  RETURN jsonb_build_object(
    'ok', true,
    'ticketId', v_ticket_id,
    'valorLiquido', ROUND(p_valor_unit * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;

-- Fix C1: Race condition overselling
-- ANTES: SELECT sem FOR UPDATE permitia 2 compras simultâneas do último ingresso
-- DEPOIS: FOR UPDATE trava a linha da variação antes de verificar estoque

CREATE OR REPLACE FUNCTION processar_compra_checkout(
  p_evento_id    UUID,
  p_lote_id      UUID,
  p_variacao_id  UUID,
  p_email        TEXT,
  p_valor_unit   NUMERIC,
  p_quantidade   INTEGER DEFAULT 1,
  p_comprador_id UUID    DEFAULT NULL,
  p_taxa         NUMERIC DEFAULT 0.05,
  p_ref_code     TEXT    DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket_id   UUID;
  v_total_bruto NUMERIC;
  v_tickets     JSONB := '[]'::JSONB;
  v_taxa        NUMERIC;
  v_com_id      UUID;
  v_new_count   INTEGER;
  v_vendidos    INTEGER;
  v_limite      INTEGER;
  i             INTEGER;
BEGIN
  -- Taxa calculada server-side: evento → comunidade → padrão 0.05
  SELECT COALESCE(e.vanta_fee_percent, c.vanta_fee_percent, 0.05)
  INTO v_taxa
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.id = p_evento_id;

  IF v_taxa IS NULL THEN v_taxa := 0.05; END IF;

  v_total_bruto := p_valor_unit * p_quantidade;

  -- ⚡ FIX: Lock a linha da variação com FOR UPDATE para prevenir race condition
  SELECT vendidos, limite INTO v_vendidos, v_limite
  FROM variacoes_ingresso
  WHERE id = p_variacao_id
  FOR UPDATE;

  IF v_vendidos + p_quantidade > v_limite THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  FOR i IN 1..p_quantidade LOOP
    INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, owner_id, valor, status, origem)
    VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_comprador_id, p_valor_unit, 'DISPONIVEL', 'ANTECIPADO')
    RETURNING id INTO v_ticket_id;

    INSERT INTO transactions (evento_id, ticket_id, comprador_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
    VALUES (p_evento_id, v_ticket_id, p_comprador_id, p_email, p_valor_unit,
            ROUND(p_valor_unit * (1 - v_taxa), 2), v_taxa, 'CONCLUIDO', 'VENDA_CHECKOUT');

    v_tickets := v_tickets || jsonb_build_object('ticketId', v_ticket_id);
  END LOOP;

  -- Incremento atômico APÓS o lock (1 UPDATE, não N)
  UPDATE variacoes_ingresso SET vendidos = vendidos + p_quantidade WHERE id = p_variacao_id;

  -- Vendas log consolidado (1 INSERT)
  INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor, origem)
  SELECT p_evento_id, p_variacao_id, CONCAT(area, ' · ', genero), p_valor_unit * p_quantidade, 'ANTECIPADO'
  FROM variacoes_ingresso WHERE id = p_variacao_id;

  -- Tracking ref_code: incrementar vendas_count na comemoração
  IF p_ref_code IS NOT NULL AND p_ref_code <> '' THEN
    UPDATE comemoracoes
    SET vendas_count = vendas_count + p_quantidade
    WHERE ref_code = p_ref_code
      AND status = 'APROVADA'
    RETURNING id, vendas_count INTO v_com_id, v_new_count;

    IF v_com_id IS NOT NULL THEN
      PERFORM gerar_cortesias_comemoracao(v_com_id);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'tickets', v_tickets,
    'totalBruto', v_total_bruto,
    'totalLiquido', ROUND(v_total_bruto * (1 - v_taxa), 2),
    'taxaAplicada', v_taxa
  );
END;
$$;

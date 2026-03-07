-- 1. Alterar RPC processar_compra_checkout para aceitar ref_code e incrementar vendas_count
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

  IF EXISTS (SELECT 1 FROM variacoes_ingresso WHERE id = p_variacao_id AND vendidos >= limite) THEN
    RETURN jsonb_build_object('ok', false, 'erro', 'Ingresso esgotado.');
  END IF;

  FOR i IN 1..p_quantidade LOOP
    INSERT INTO tickets_caixa (evento_id, lote_id, variacao_id, email, owner_id, valor, status, origem)
    VALUES (p_evento_id, p_lote_id, p_variacao_id, p_email, p_comprador_id, p_valor_unit, 'DISPONIVEL', 'ANTECIPADO')
    RETURNING id INTO v_ticket_id;

    INSERT INTO transactions (evento_id, ticket_id, comprador_id, email, valor_bruto, valor_liquido, taxa_aplicada, status, tipo)
    VALUES (p_evento_id, v_ticket_id, p_comprador_id, p_email, p_valor_unit,
            ROUND(p_valor_unit * (1 - v_taxa), 2), v_taxa, 'CONCLUIDO', 'VENDA_CHECKOUT');

    UPDATE variacoes_ingresso SET vendidos = vendidos + 1 WHERE id = p_variacao_id;

    INSERT INTO vendas_log (evento_id, variacao_id, variacao_label, valor, origem)
    SELECT p_evento_id, p_variacao_id, CONCAT(area, ' · ', genero), p_valor_unit, 'ANTECIPADO'
    FROM variacoes_ingresso WHERE id = p_variacao_id;

    v_tickets := v_tickets || jsonb_build_object('ticketId', v_ticket_id);
  END LOOP;

  -- Tracking ref_code: incrementar vendas_count na comemoração
  IF p_ref_code IS NOT NULL AND p_ref_code <> '' THEN
    UPDATE comemoracoes
    SET vendas_count = vendas_count + p_quantidade
    WHERE ref_code = p_ref_code
      AND status = 'APROVADA'
    RETURNING id, vendas_count INTO v_com_id, v_new_count;

    -- Gerar cortesias automaticamente se atingiu nova faixa
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

-- 2. Função para gerar cortesias automaticamente ao atingir faixas
CREATE OR REPLACE FUNCTION gerar_cortesias_comemoracao(p_comemoracao_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_vendas      INTEGER;
  v_evento_id   UUID;
  v_config_id   UUID;
  r_faixa       RECORD;
  v_existing     INTEGER;
  v_to_generate  INTEGER;
  j              INTEGER;
BEGIN
  -- Buscar vendas atuais e evento_id
  SELECT vendas_count, evento_id INTO v_vendas, v_evento_id
  FROM comemoracoes WHERE id = p_comemoracao_id;

  IF v_evento_id IS NULL THEN RETURN; END IF;

  -- Buscar config do evento
  SELECT id INTO v_config_id
  FROM comemoracoes_config
  WHERE evento_id = v_evento_id AND habilitado = true;

  IF v_config_id IS NULL THEN RETURN; END IF;

  -- Iterar faixas atingidas
  FOR r_faixa IN
    SELECT id, min_vendas, cortesias
    FROM comemoracoes_faixas
    WHERE config_id = v_config_id AND min_vendas <= v_vendas
    ORDER BY min_vendas
  LOOP
    -- Contar cortesias já geradas para esta faixa
    SELECT COUNT(*) INTO v_existing
    FROM comemoracoes_cortesias
    WHERE comemoracao_id = p_comemoracao_id AND faixa_id = r_faixa.id;

    v_to_generate := r_faixa.cortesias - v_existing;

    IF v_to_generate > 0 THEN
      FOR j IN 1..v_to_generate LOOP
        INSERT INTO comemoracoes_cortesias (comemoracao_id, faixa_id, resgatado)
        VALUES (p_comemoracao_id, r_faixa.id, false);
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- 3. Função para vincular comemoração a evento automaticamente por data
CREATE OR REPLACE FUNCTION vincular_comemoracao_evento()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Quando um evento é criado, vincular comemorações pendentes da mesma comunidade+data
  UPDATE comemoracoes
  SET evento_id = NEW.id
  WHERE comunidade_id = NEW.comunidade_id
    AND evento_id IS NULL
    AND data_comemoracao = NEW.data_real
    AND status IN ('ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA');

  RETURN NEW;
END;
$$;

-- Trigger: ao inserir evento, vincular comemorações
DROP TRIGGER IF EXISTS trg_vincular_comemoracao_evento ON eventos_admin;
CREATE TRIGGER trg_vincular_comemoracao_evento
  AFTER INSERT ON eventos_admin
  FOR EACH ROW
  EXECUTE FUNCTION vincular_comemoracao_evento();

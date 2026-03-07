-- Preço Dinâmico / Early Bird — virada de lote por % vendido

ALTER TABLE lotes ADD COLUMN IF NOT EXISTS virar_pct INTEGER;
-- Ex: virar_pct = 80 → quando 80% das variações vendidas, lote desativa e próximo ativa

CREATE OR REPLACE FUNCTION verificar_virada_lote(p_evento_id UUID)
RETURNS VOID AS $$
DECLARE
  v_lote RECORD;
  v_total_limite INTEGER;
  v_total_vendidos INTEGER;
  v_pct NUMERIC;
  v_proximo_id UUID;
BEGIN
  -- Busca lote ativo do evento
  SELECT * INTO v_lote FROM lotes
    WHERE evento_id = p_evento_id AND ativo = true
    ORDER BY ordem LIMIT 1;

  IF NOT FOUND OR v_lote.virar_pct IS NULL THEN RETURN; END IF;

  -- Soma limites e vendidos das variações do lote
  SELECT COALESCE(SUM(limite), 0), COALESCE(SUM(vendidos), 0)
    INTO v_total_limite, v_total_vendidos
    FROM variacoes_ingresso WHERE lote_id = v_lote.id;

  IF v_total_limite = 0 THEN RETURN; END IF;

  v_pct := (v_total_vendidos::NUMERIC / v_total_limite) * 100;

  IF v_pct >= v_lote.virar_pct THEN
    -- Desativa lote atual
    UPDATE lotes SET ativo = false WHERE id = v_lote.id;

    -- Ativa próximo lote (por ordem)
    SELECT id INTO v_proximo_id FROM lotes
      WHERE evento_id = p_evento_id AND ativo = false AND ordem > v_lote.ordem
      ORDER BY ordem LIMIT 1;

    IF v_proximo_id IS NOT NULL THEN
      UPDATE lotes SET ativo = true WHERE id = v_proximo_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Evento Recorrente v2: corrige RPC (colunas corretas) + copia lotes/equipe/listas + cancelar série

-- ── 1. RPC corrigida: gerar ocorrências com colunas reais ──────────────────
CREATE OR REPLACE FUNCTION gerar_ocorrencias_recorrente(
  p_evento_id UUID,
  p_copiar_lotes BOOLEAN DEFAULT true,
  p_copiar_equipe BOOLEAN DEFAULT true,
  p_copiar_listas BOOLEAN DEFAULT true
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ev        RECORD;
  v_intervalo INTERVAL;
  v_data      DATE;
  v_count     INTEGER := 0;
  v_new_id    UUID;
  v_inicio    TIMESTAMPTZ;
  v_fim       TIMESTAMPTZ;
  v_duracao   INTERVAL;
  v_lote      RECORD;
  v_new_lote  UUID;
  v_lista     RECORD;
  v_new_lista UUID;
  v_regra     RECORD;
  v_new_regra UUID;
BEGIN
  SELECT * INTO v_ev FROM eventos_admin WHERE id = p_evento_id;
  IF v_ev IS NULL OR v_ev.recorrencia = 'UNICO' OR v_ev.recorrencia_ate IS NULL THEN
    RETURN 0;
  END IF;

  v_intervalo := CASE v_ev.recorrencia
    WHEN 'SEMANAL' THEN '7 days'::INTERVAL
    WHEN 'QUINZENAL' THEN '14 days'::INTERVAL
    WHEN 'MENSAL' THEN '1 month'::INTERVAL
    ELSE '7 days'::INTERVAL
  END;

  v_duracao := v_ev.data_fim - v_ev.data_inicio;
  v_data := (v_ev.data_inicio::DATE) + v_intervalo;

  WHILE v_data <= v_ev.recorrencia_ate LOOP
    -- Não criar se já existe ocorrência nesta data
    IF NOT EXISTS (
      SELECT 1 FROM eventos_admin
      WHERE evento_origem_id = p_evento_id AND data_inicio::DATE = v_data
    ) THEN
      v_inicio := v_data + (v_ev.data_inicio::TIME)::INTERVAL;
      v_fim := v_inicio + v_duracao;

      INSERT INTO eventos_admin (
        comunidade_id, nome, descricao, data_inicio, data_fim,
        local, endereco, cidade, coords, foto,
        formato, estilos, experiencias,
        publicado, recorrencia, evento_origem_id,
        vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode,
        taxa_processamento_percent, quem_paga_servico,
        taxa_porta_percent, taxa_minima, taxa_fixa_evento,
        cota_nomes_lista, taxa_nome_excedente,
        cota_cortesias, taxa_cortesia_excedente_pct,
        prazo_pagamento_dias, tipo_fluxo, categoria, subcategorias,
        created_by
      )
      SELECT
        comunidade_id, nome, descricao, v_inicio, v_fim,
        local, endereco, cidade, coords, foto,
        formato, estilos, experiencias,
        false, 'UNICO', p_evento_id,
        vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode,
        taxa_processamento_percent, quem_paga_servico,
        taxa_porta_percent, taxa_minima, taxa_fixa_evento,
        cota_nomes_lista, taxa_nome_excedente,
        cota_cortesias, taxa_cortesia_excedente_pct,
        prazo_pagamento_dias, tipo_fluxo, categoria, subcategorias,
        created_by
      FROM eventos_admin WHERE id = p_evento_id
      RETURNING id INTO v_new_id;

      -- Copiar lotes + variações
      IF p_copiar_lotes THEN
        FOR v_lote IN SELECT * FROM lotes WHERE evento_id = p_evento_id ORDER BY ordem LOOP
          INSERT INTO lotes (evento_id, nome, data_validade, ativo, ordem)
          VALUES (v_new_id, v_lote.nome, v_lote.data_validade, v_lote.ativo, v_lote.ordem)
          RETURNING id INTO v_new_lote;

          INSERT INTO variacoes_ingresso (lote_id, area, area_custom, genero, valor, limite, vendidos)
          SELECT v_new_lote, area, area_custom, genero, valor, limite, 0
          FROM variacoes_ingresso WHERE lote_id = v_lote.id;
        END LOOP;
      END IF;

      -- Copiar equipe
      IF p_copiar_equipe THEN
        INSERT INTO equipe_evento (evento_id, membro_id, papel, liberar_lista)
        SELECT v_new_id, membro_id, papel, liberar_lista
        FROM equipe_evento WHERE evento_id = p_evento_id;
      END IF;

      -- Copiar listas + regras (sem cotas individuais — produtor distribui)
      IF p_copiar_listas THEN
        FOR v_lista IN SELECT * FROM listas_evento WHERE evento_id = p_evento_id LOOP
          INSERT INTO listas_evento (evento_id, teto_global_total)
          VALUES (v_new_id, v_lista.teto_global_total)
          RETURNING id INTO v_new_lista;

          FOR v_regra IN SELECT * FROM regras_lista WHERE lista_id = v_lista.id LOOP
            INSERT INTO regras_lista (lista_id, label, teto_global, saldo_banco, cor, valor)
            VALUES (v_new_lista, v_regra.label, v_regra.teto_global, v_regra.saldo_banco, v_regra.cor, v_regra.valor);
          END LOOP;
        END LOOP;
      END IF;

      v_count := v_count + 1;
    END IF;

    v_data := v_data + v_intervalo;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ── 2. RPC: cancelar ocorrências futuras não publicadas ─────────────────────
CREATE OR REPLACE FUNCTION cancelar_serie_recorrente(p_evento_origem_id UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM eventos_admin
  WHERE evento_origem_id = p_evento_origem_id
    AND publicado = false
    AND data_inicio > now()
  ;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ── 3. RPC: listar ocorrências de uma série ────────────────────────────────
CREATE OR REPLACE FUNCTION get_ocorrencias_serie(p_evento_origem_id UUID)
RETURNS TABLE(
  id UUID,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  publicado BOOLEAN,
  status_evento TEXT,
  total_vendidos BIGINT
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.data_inicio,
    e.data_fim,
    e.publicado,
    e.status_evento,
    COALESCE((SELECT COUNT(*) FROM tickets_caixa t WHERE t.evento_id = e.id AND t.status != 'CANCELADO'), 0) AS total_vendidos
  FROM eventos_admin e
  WHERE e.evento_origem_id = p_evento_origem_id
     OR e.id = p_evento_origem_id
  ORDER BY e.data_inicio;
END;
$$;

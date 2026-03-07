-- Evento Recorrente: campos de recorrência
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS recorrencia TEXT NOT NULL DEFAULT 'UNICO';
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS recorrencia_ate DATE;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS evento_origem_id UUID REFERENCES eventos_admin(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eventos_admin_origem ON eventos_admin(evento_origem_id);

-- RPC para gerar ocorrências de evento recorrente
CREATE OR REPLACE FUNCTION gerar_ocorrencias_recorrente(p_evento_id UUID)
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
        comunidade_id, nome, descricao, data_inicio, data_fim, data_real,
        local, endereco, cidade, lat, lng, foto,
        formato, estilos, experiencias, dress_code, lineup,
        publicado, recorrencia, evento_origem_id,
        fee_percent, fee_fixed, fee_mode,
        gateway_fee_mode, taxa_processamento_percent,
        quem_paga_servico, criado_por
      )
      SELECT
        comunidade_id, nome, descricao, v_inicio, v_fim, v_data::TEXT,
        local, endereco, cidade, lat, lng, foto,
        formato, estilos, experiencias, dress_code, lineup,
        false, 'UNICO', p_evento_id,
        fee_percent, fee_fixed, fee_mode,
        gateway_fee_mode, taxa_processamento_percent,
        quem_paga_servico, criado_por
      FROM eventos_admin WHERE id = p_evento_id
      RETURNING id INTO v_new_id;

      v_count := v_count + 1;
    END IF;

    v_data := v_data + v_intervalo;
  END LOOP;

  RETURN v_count;
END;
$$;

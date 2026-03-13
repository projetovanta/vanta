-- Fix ERRO 1+2: registrar_noshow_evento_finalizado referencia reservas_mais_vanta (inexistente)
-- Corrige para usar resgates_mv_evento (tabela real)
-- Fix ERRO 3: notificar_lembrete_reserva_mv mesmo problema + bug de TIMESTAMPTZ concat

-- ============================================================
-- 1. registrar_noshow_evento_finalizado (trigger on eventos_admin)
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_noshow_evento_finalizado()
RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
  v_count INT;
  v_limite INT;
  v_bloqueio1 INT;
  v_bloqueio2 INT;
BEGIN
  IF NEW.status_evento <> 'FINALIZADO' OR OLD.status_evento = 'FINALIZADO' THEN
    RETURN NEW;
  END IF;

  v_limite := 3;
  v_bloqueio1 := 30;
  v_bloqueio2 := 60;

  FOR r IN
    SELECT rmv.id AS reserva_id, rmv.user_id, rmv.evento_id
    FROM resgates_mv_evento rmv
    WHERE rmv.evento_id = NEW.id
      AND rmv.status = 'RESGATADO'
  LOOP
    UPDATE resgates_mv_evento
    SET status = 'NO_SHOW'
    WHERE id = r.reserva_id;

    INSERT INTO infracoes_mais_vanta (user_id, tipo, evento_id, evento_nome, criado_por)
    VALUES (r.user_id, 'NO_SHOW', r.evento_id, NEW.nome, '00000000-0000-0000-0000-000000000000');

    SELECT COUNT(*) INTO v_count
    FROM infracoes_mais_vanta
    WHERE user_id = r.user_id;

    IF v_count >= v_limite * 2 + 1 THEN
      UPDATE membros_clube
      SET bloqueio_nivel = 3, banido_permanente = true, banido_em = NOW(), ativo = false
      WHERE user_id = r.user_id AND bloqueio_nivel = 2;
    ELSIF v_count >= v_limite * 2 THEN
      UPDATE membros_clube
      SET bloqueio_nivel = 2, bloqueio_ate = NOW() + (v_bloqueio2 || ' days')::interval
      WHERE user_id = r.user_id AND bloqueio_nivel = 1;
    ELSIF v_count >= v_limite THEN
      UPDATE membros_clube
      SET bloqueio_nivel = 1, bloqueio_ate = NOW() + (v_bloqueio1 || ' days')::interval
      WHERE user_id = r.user_id AND bloqueio_nivel = 0;
    END IF;

    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, lida, created_at)
    VALUES (
      r.user_id,
      'MV_NOSHOW_REGISTRADO',
      'Infração registrada',
      'Você reservou ingresso para "' || COALESCE(NEW.nome, 'evento') || '" e não compareceu. Infração NO_SHOW registrada.',
      r.evento_id::text,
      false,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. notificar_lembrete_reserva_mv (chamada por pg_cron)
-- ============================================================
CREATE OR REPLACE FUNCTION notificar_lembrete_reserva_mv()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT rmv.id AS reserva_id, rmv.user_id, rmv.evento_id,
           ea.nome AS evento_nome
    FROM resgates_mv_evento rmv
    JOIN eventos_admin ea ON ea.id = rmv.evento_id
    WHERE rmv.status = 'RESGATADO'
      AND ea.status_evento IN ('ATIVO', 'EM_ANDAMENTO')
      AND ea.data_inicio BETWEEN NOW() AND NOW() + INTERVAL '12 hours'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = rmv.user_id
          AND n.tipo = 'MV_LEMBRETE_RESERVA'
          AND n.link = rmv.evento_id::text
      )
  LOOP
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, lida, created_at)
    VALUES (
      r.user_id,
      'MV_LEMBRETE_RESERVA',
      'Lembrete de reserva',
      'Você tem reserva para "' || COALESCE(r.evento_nome, 'evento') || '". Se não puder ir, cancele antes para evitar infração.',
      r.evento_id::text,
      false,
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

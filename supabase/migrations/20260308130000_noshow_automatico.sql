-- ═══════════════════════════════════════════════════════════════════════════════
-- NO_SHOW AUTOMÁTICO — Infrações automáticas para reservas MV
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Função: quando evento muda para FINALIZADO, registra NO_SHOW
--    para membros que tinham reserva RESERVADO mas não fizeram check-in
CREATE OR REPLACE FUNCTION registrar_noshow_evento_finalizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_config RECORD;
  v_count INT;
  v_limite INT;
  v_bloqueio1 INT;
  v_bloqueio2 INT;
BEGIN
  -- Só dispara quando status muda para FINALIZADO
  IF NEW.status_evento <> 'FINALIZADO' OR OLD.status_evento = 'FINALIZADO' THEN
    RETURN NEW;
  END IF;

  -- Buscar config de infrações (da mais_vanta_config ou defaults)
  v_limite := 3;
  v_bloqueio1 := 30;
  v_bloqueio2 := 60;

  -- Iterar reservas MV do evento que estão RESERVADO (não fizeram check-in nem cancelaram)
  FOR r IN
    SELECT rmv.id AS reserva_id, rmv.user_id, rmv.evento_id
    FROM reservas_mais_vanta rmv
    WHERE rmv.evento_id = NEW.id
      AND rmv.status = 'RESERVADO'
  LOOP
    -- Marcar reserva como NO_SHOW
    UPDATE reservas_mais_vanta
    SET status = 'NO_SHOW'
    WHERE id = r.reserva_id;

    -- Inserir infração
    INSERT INTO infracoes_mais_vanta (user_id, tipo, evento_id, evento_nome, criado_por)
    VALUES (r.user_id, 'NO_SHOW', r.evento_id, NEW.nome, '00000000-0000-0000-0000-000000000000');

    -- Contar infrações acumuladas
    SELECT COUNT(*) INTO v_count
    FROM infracoes_mais_vanta
    WHERE user_id = r.user_id;

    -- Aplicar bloqueio progressivo
    IF v_count >= v_limite * 2 + 1 THEN
      -- Ban permanente (3ª vez)
      UPDATE membros_clube
      SET bloqueio_nivel = 3, banido_permanente = true, banido_em = NOW(), ativo = false
      WHERE user_id = r.user_id AND bloqueio_nivel = 2;
    ELSIF v_count >= v_limite * 2 THEN
      -- 2º bloqueio
      UPDATE membros_clube
      SET bloqueio_nivel = 2, bloqueio_ate = NOW() + (v_bloqueio2 || ' days')::interval
      WHERE user_id = r.user_id AND bloqueio_nivel = 1;
    ELSIF v_count >= v_limite THEN
      -- 1º bloqueio
      UPDATE membros_clube
      SET bloqueio_nivel = 1, bloqueio_ate = NOW() + (v_bloqueio1 || ' days')::interval
      WHERE user_id = r.user_id AND bloqueio_nivel = 0;
    END IF;

    -- Notificar membro (INSERT direto — trigger é SECURITY DEFINER, sem auth.uid())
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
$$;

-- 2. Trigger no eventos_admin
DROP TRIGGER IF EXISTS trg_evento_finalizado_noshow ON eventos_admin;
CREATE TRIGGER trg_evento_finalizado_noshow
  AFTER UPDATE OF status_evento ON eventos_admin
  FOR EACH ROW
  WHEN (NEW.status_evento = 'FINALIZADO' AND OLD.status_evento <> 'FINALIZADO')
  EXECUTE FUNCTION registrar_noshow_evento_finalizado();

-- 3. Cron: lembrete 12h antes do evento para membros com reserva
--    Notifica quem tem reserva RESERVADO e o evento começa nas próximas 12h
CREATE OR REPLACE FUNCTION notificar_lembrete_reserva_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_evento_inicio TIMESTAMPTZ;
BEGIN
  FOR r IN
    SELECT rmv.id AS reserva_id, rmv.user_id, rmv.evento_id,
           ea.nome AS evento_nome, ea.data_inicio, ea.horario
    FROM reservas_mais_vanta rmv
    JOIN eventos_admin ea ON ea.id = rmv.evento_id
    WHERE rmv.status = 'RESERVADO'
      AND ea.status_evento IN ('ATIVO', 'EM_ANDAMENTO')
      -- Evento começa nas próximas 12h
      AND (ea.data_inicio || 'T' || COALESCE(ea.horario, '23:59') || ':00-03:00')::timestamptz
          BETWEEN NOW() AND NOW() + INTERVAL '12 hours'
      -- Não notificou ainda (checar se já existe notificação MV_LEMBRETE_RESERVA para este par)
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
$$;

-- Agendar cron a cada 30 minutos (para pegar a janela de 12h com precisão)
SELECT cron.schedule(
  'lembrete-reserva-mv',
  '*/30 * * * *',
  $$SELECT notificar_lembrete_reserva_mv()$$
);

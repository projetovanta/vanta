-- Migration: Adicionar SET search_path TO 'public' nas 9 funções vulneráveis
-- Motivo: Supabase advisor WARN — search_path mutable permite injection

-- 1. set_updated_at (trigger genérico)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. update_cargos_plataforma_updated_at (trigger)
CREATE OR REPLACE FUNCTION public.update_cargos_plataforma_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. aceitar_convite_mv
CREATE OR REPLACE FUNCTION public.aceitar_convite_mv(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_convite RECORD;
  v_user_id UUID;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_convite FROM convites_mais_vanta WHERE token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;
  IF v_convite.status != 'PENDENTE' THEN
    RAISE EXCEPTION 'Convite já utilizado ou expirado';
  END IF;
  IF v_convite.expira_em < now() THEN
    UPDATE convites_mais_vanta SET status = 'EXPIRADO' WHERE id = v_convite.id;
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  UPDATE convites_mais_vanta
  SET status = 'ACEITO', aceito_por = v_user_id, aceito_em = now()
  WHERE id = v_convite.id;

  IF v_convite.tipo = 'MEMBRO' THEN
    IF EXISTS (SELECT 1 FROM membros_clube WHERE user_id = v_user_id AND ativo = true) THEN
      RAISE EXCEPTION 'Você já é membro do MAIS VANTA';
    END IF;

    INSERT INTO membros_clube (user_id, tier, categoria, convidado_por, ativo)
    VALUES (v_user_id, COALESCE(v_convite.tier, 'lista'), COALESCE(v_convite.tier, 'lista'), v_convite.criado_por, true)
    ON CONFLICT (user_id) DO UPDATE SET
      ativo = true,
      tier = COALESCE(v_convite.tier, 'lista'),
      categoria = COALESCE(v_convite.tier, 'lista'),
      convidado_por = v_convite.criado_por;

    v_result := jsonb_build_object('tipo', 'MEMBRO', 'tier', COALESCE(v_convite.tier, 'lista'));

  ELSIF v_convite.tipo = 'PARCEIRO' THEN
    v_result := jsonb_build_object('tipo', 'PARCEIRO', 'cidade_id', v_convite.cidade_id, 'parceiro_nome', v_convite.parceiro_nome);
  END IF;

  INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, created_at)
  VALUES (
    v_user_id,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'MV_APROVADO' ELSE 'PARCERIA_APROVADA' END,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'Bem-vindo ao MAIS VANTA!' ELSE 'Parceria confirmada!' END,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'Você agora faz parte do MAIS VANTA. Explore seus benefícios!' ELSE 'Sua parceria foi confirmada. Configure seus deals!' END,
    false,
    now()
  );

  RETURN v_result;
END;
$function$;

-- 4. finalizar_eventos_expirados
CREATE OR REPLACE FUNCTION public.finalizar_eventos_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_evento_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO v_evento_ids
  FROM eventos_admin
  WHERE status_evento IN ('ATIVO', 'EM_ANDAMENTO')
    AND data_fim IS NOT NULL
    AND data_fim < NOW();

  IF v_evento_ids IS NULL OR array_length(v_evento_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  UPDATE eventos_admin
  SET status_evento = 'FINALIZADO', updated_at = NOW()
  WHERE id = ANY(v_evento_ids);

  UPDATE tickets_caixa
  SET status = 'EXPIRADO'
  WHERE evento_id = ANY(v_evento_ids)
    AND status = 'DISPONIVEL';
END;
$function$;

-- 5. registrar_noshow_evento_finalizado
CREATE OR REPLACE FUNCTION public.registrar_noshow_evento_finalizado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 6. vincular_comemoracao_evento
CREATE OR REPLACE FUNCTION public.vincular_comemoracao_evento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE comemoracoes
  SET evento_id = NEW.id
  WHERE comunidade_id = NEW.comunidade_id
    AND evento_id IS NULL
    AND data_comemoracao = to_char(NEW.data_inicio AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')
    AND status IN ('ENVIADA', 'VISUALIZADA', 'EM_ANALISE', 'APROVADA');

  RETURN NEW;
END;
$function$;

-- 7. notificar_deal_sugerido
CREATE OR REPLACE FUNCTION public.notificar_deal_sugerido()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parceiro_nome TEXT;
  v_masters RECORD;
BEGIN
  IF NEW.status = 'RASCUNHO' THEN
    SELECT nome INTO v_parceiro_nome FROM parceiros_mais_vanta WHERE id = NEW.parceiro_id;

    FOR v_masters IN SELECT id FROM profiles WHERE role = 'vanta_masteradm' LOOP
      INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, created_at)
      VALUES (
        v_masters.id,
        'MV_DEAL_SUGERIDO',
        'Novo deal sugerido',
        COALESCE(v_parceiro_nome, 'Parceiro') || ' sugeriu um deal: ' || COALESCE(NEW.titulo, 'Sem título'),
        false,
        now()
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- 8. notificar_lembrete_reserva_mv
CREATE OR REPLACE FUNCTION public.notificar_lembrete_reserva_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- 9. is_event_manager_or_admin (será dropada na próxima migration, mas corrigir antes)
-- Não precisa recriar — vai ser dropada

-- Fix: aceitar_convite_mv referenciava tabela "notificacoes" (não existe)
-- Correto: "notifications" com colunas (user_id, tipo, titulo, mensagem, lida, created_at)

CREATE OR REPLACE FUNCTION public.aceitar_convite_mv(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    VALUES (v_user_id, COALESCE(v_convite.tier, 'CONVIDADO'), COALESCE(v_convite.tier, 'CONVIDADO'), v_convite.criado_por, true)
    ON CONFLICT (user_id) DO UPDATE SET
      ativo = true,
      tier = COALESCE(v_convite.tier, 'CONVIDADO'),
      categoria = COALESCE(v_convite.tier, 'CONVIDADO'),
      convidado_por = v_convite.criado_por;

    v_result := jsonb_build_object('tipo', 'MEMBRO', 'tier', COALESCE(v_convite.tier, 'CONVIDADO'));

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
$$;

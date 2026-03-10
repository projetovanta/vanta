-- Migration: Renomear tiers MAIS VANTA
-- BRONZE → CONVIDADO, PRATA → PRESENCA, OURO → CREATOR, DIAMANTE → VANTA_BLACK
-- Atualiza: tiers_mais_vanta, membros_clube, lotes_mais_vanta, solicitacoes_clube
-- Remove CHECKs antigos e recria com novos valores

BEGIN;

-- ══ 1. Remover CHECK constraints antigos ══

ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_tier_check;
ALTER TABLE lotes_mais_vanta DROP CONSTRAINT IF EXISTS lotes_mais_vanta_tier_minimo_check;
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_tier_atribuido_check;

-- ══ 2. Atualizar dados em tiers_mais_vanta (tabela dinâmica) ══

-- Inserir novos tiers primeiro (para não conflitar com FK se houver)
INSERT INTO tiers_mais_vanta (id, nome, cor, ordem, beneficios, limite_mensal)
VALUES
  ('CONVIDADO', 'Convidado', '#A1A1AA', 1, ARRAY['INGRESSO_CORTESIA'], 2),
  ('PRESENCA', 'Presença', '#FB7185', 2, ARRAY['INGRESSO_CORTESIA','PRIORIDADE'], 5),
  ('CREATOR', 'Creator', '#FFD300', 3, ARRAY['INGRESSO_CORTESIA','ACOMPANHANTE','PRIORIDADE','RESERVA_ANTECIPADA'], 10),
  ('VANTA_BLACK', 'Vanta Black', '#E8E8E8', 4, ARRAY['INGRESSO_CORTESIA','ACOMPANHANTE','PRIORIDADE','RESERVA_ANTECIPADA','PASSPORT_GLOBAL'], -1)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem,
  beneficios = EXCLUDED.beneficios,
  limite_mensal = EXCLUDED.limite_mensal;

-- ══ 3. Atualizar referências nas tabelas de dados ══

-- membros_clube.tier
UPDATE membros_clube SET tier = 'CONVIDADO' WHERE tier = 'BRONZE';
UPDATE membros_clube SET tier = 'PRESENCA' WHERE tier = 'PRATA';
UPDATE membros_clube SET tier = 'CREATOR' WHERE tier = 'OURO';
UPDATE membros_clube SET tier = 'VANTA_BLACK' WHERE tier = 'DIAMANTE';

-- membros_clube.categoria (sincronizar com tier)
UPDATE membros_clube SET categoria = tier WHERE categoria IS NULL OR categoria IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE');

-- lotes_mais_vanta.tier_minimo
UPDATE lotes_mais_vanta SET tier_minimo = 'CONVIDADO' WHERE tier_minimo = 'BRONZE';
UPDATE lotes_mais_vanta SET tier_minimo = 'PRESENCA' WHERE tier_minimo = 'PRATA';
UPDATE lotes_mais_vanta SET tier_minimo = 'CREATOR' WHERE tier_minimo = 'OURO';
UPDATE lotes_mais_vanta SET tier_minimo = 'VANTA_BLACK' WHERE tier_minimo = 'DIAMANTE';

-- solicitacoes_clube.tier_atribuido
UPDATE solicitacoes_clube SET tier_atribuido = 'CONVIDADO' WHERE tier_atribuido = 'BRONZE';
UPDATE solicitacoes_clube SET tier_atribuido = 'PRESENCA' WHERE tier_atribuido = 'PRATA';
UPDATE solicitacoes_clube SET tier_atribuido = 'CREATOR' WHERE tier_atribuido = 'OURO';
UPDATE solicitacoes_clube SET tier_atribuido = 'VANTA_BLACK' WHERE tier_atribuido = 'DIAMANTE';

-- convites_mais_vanta.tier
UPDATE convites_mais_vanta SET tier = 'CONVIDADO' WHERE tier = 'BRONZE';
UPDATE convites_mais_vanta SET tier = 'PRESENCA' WHERE tier = 'PRATA';
UPDATE convites_mais_vanta SET tier = 'CREATOR' WHERE tier = 'OURO';
UPDATE convites_mais_vanta SET tier = 'VANTA_BLACK' WHERE tier = 'DIAMANTE';

-- planos_mais_vanta.tier_minimo (se existir)
UPDATE planos_mais_vanta SET tier_minimo = 'CONVIDADO' WHERE tier_minimo = 'BRONZE';
UPDATE planos_mais_vanta SET tier_minimo = 'PRESENCA' WHERE tier_minimo = 'PRATA';
UPDATE planos_mais_vanta SET tier_minimo = 'CREATOR' WHERE tier_minimo = 'OURO';
UPDATE planos_mais_vanta SET tier_minimo = 'VANTA_BLACK' WHERE tier_minimo = 'DIAMANTE';

-- ══ 4. Remover tiers antigos da tabela dinâmica ══

DELETE FROM tiers_mais_vanta WHERE id IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE');

-- ══ 5. Atualizar RPC aceitar_convite_mv (default BRONZE → CONVIDADO) ══

CREATE OR REPLACE FUNCTION aceitar_convite_mv(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Notificação de boas-vindas
  INSERT INTO notificacoes (user_id, tipo, titulo, corpo, data)
  VALUES (
    v_user_id,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'MV_APROVADO' ELSE 'PARCERIA_APROVADA' END,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'Bem-vindo ao MAIS VANTA!' ELSE 'Parceria confirmada!' END,
    CASE WHEN v_convite.tipo = 'MEMBRO' THEN 'Você agora faz parte do MAIS VANTA. Explore seus benefícios!' ELSE 'Sua parceria foi confirmada. Configure seus deals!' END,
    jsonb_build_object('convite_id', v_convite.id)
  );

  RETURN v_result;
END;
$$;

-- ══ 6. Recriar CHECK constraints com novos valores ══

ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_tier_check
  CHECK (tier IN ('CONVIDADO', 'PRESENCA', 'CREATOR', 'VANTA_BLACK'));

ALTER TABLE lotes_mais_vanta ADD CONSTRAINT lotes_mais_vanta_tier_minimo_check
  CHECK (tier_minimo IN ('CONVIDADO', 'PRESENCA', 'CREATOR', 'VANTA_BLACK'));

ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_tier_atribuido_check
  CHECK (tier_atribuido IS NULL OR tier_atribuido IN ('CONVIDADO', 'PRESENCA', 'CREATOR', 'VANTA_BLACK'));

COMMIT;

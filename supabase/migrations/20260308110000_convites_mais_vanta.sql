-- ============================================================
-- CONVITES MAIS VANTA — Links únicos pra convidar membros/parceiros
-- ============================================================

CREATE TABLE IF NOT EXISTS public.convites_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  tipo TEXT NOT NULL CHECK (tipo IN ('MEMBRO', 'PARCEIRO')),
  tier TEXT, -- só pra tipo MEMBRO (BRONZE, PRATA, OURO, DIAMANTE)
  cidade_id UUID REFERENCES public.cidades_mais_vanta(id),
  parceiro_nome TEXT, -- só pra tipo PARCEIRO — nome sugerido
  criado_por UUID NOT NULL REFERENCES public.profiles(id),
  aceito_por UUID REFERENCES public.profiles(id),
  aceito_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ACEITO', 'EXPIRADO', 'CANCELADO')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_convites_mv_token ON public.convites_mais_vanta(token);
CREATE INDEX IF NOT EXISTS idx_convites_mv_criado_por ON public.convites_mais_vanta(criado_por);
CREATE INDEX IF NOT EXISTS idx_convites_mv_status ON public.convites_mais_vanta(status);

-- RLS
ALTER TABLE public.convites_mais_vanta ENABLE ROW LEVEL SECURITY;

-- Master pode tudo
CREATE POLICY convites_mv_master_all ON public.convites_mais_vanta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'master'
    )
  );

-- Gerente da cidade pode ver/criar convites da cidade dele
CREATE POLICY convites_mv_gerente ON public.convites_mais_vanta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cidades_mais_vanta c
      WHERE c.id = convites_mais_vanta.cidade_id
        AND c.gerente_id = auth.uid()
    )
  );

-- Qualquer autenticado pode ler convite pelo token (pra aceitar)
CREATE POLICY convites_mv_aceitar ON public.convites_mais_vanta
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RPC: aceitar convite (SECURITY DEFINER pra poder inserir em membros_clube/parceiros_mais_vanta)
CREATE OR REPLACE FUNCTION public.aceitar_convite_mv(
  p_token TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_convite RECORD;
  v_user_id UUID := auth.uid();
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Buscar convite
  SELECT * INTO v_convite
  FROM convites_mais_vanta
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  IF v_convite.status != 'PENDENTE' THEN
    RAISE EXCEPTION 'Convite já foi usado ou expirou';
  END IF;

  IF v_convite.expira_em < now() THEN
    UPDATE convites_mais_vanta SET status = 'EXPIRADO' WHERE id = v_convite.id;
    RAISE EXCEPTION 'Convite expirado';
  END IF;

  -- Marcar como aceito
  UPDATE convites_mais_vanta
  SET status = 'ACEITO', aceito_por = v_user_id, aceito_em = now()
  WHERE id = v_convite.id;

  IF v_convite.tipo = 'MEMBRO' THEN
    -- Verificar se já é membro
    IF EXISTS (SELECT 1 FROM membros_clube WHERE user_id = v_user_id AND ativo = true) THEN
      RAISE EXCEPTION 'Você já é membro do MAIS VANTA';
    END IF;

    -- Inserir como membro
    INSERT INTO membros_clube (user_id, tier, convidado_por, ativo)
    VALUES (v_user_id, COALESCE(v_convite.tier, 'BRONZE'), v_convite.criado_por, true)
    ON CONFLICT (user_id) DO UPDATE SET
      ativo = true,
      tier = COALESCE(v_convite.tier, 'BRONZE'),
      convidado_por = v_convite.criado_por;

    v_result := jsonb_build_object('tipo', 'MEMBRO', 'tier', COALESCE(v_convite.tier, 'BRONZE'));

  ELSIF v_convite.tipo = 'PARCEIRO' THEN
    -- Linkar user ao parceiro (se cidade_id presente)
    -- Parceiro já deve existir ou será criado depois pelo master
    v_result := jsonb_build_object('tipo', 'PARCEIRO', 'cidade_id', v_convite.cidade_id, 'parceiro_nome', v_convite.parceiro_nome);
  END IF;

  -- Notificação de boas-vindas
  INSERT INTO notifications (user_id, tipo, titulo, mensagem, lida, created_at)
  VALUES (
    v_user_id,
    CASE v_convite.tipo
      WHEN 'MEMBRO' THEN 'MV_APROVADO'
      WHEN 'PARCEIRO' THEN 'PARCERIA_APROVADA'
    END,
    CASE v_convite.tipo
      WHEN 'MEMBRO' THEN 'Bem-vindo ao MAIS VANTA!'
      WHEN 'PARCEIRO' THEN 'Bem-vindo como parceiro MAIS VANTA!'
    END,
    CASE v_convite.tipo
      WHEN 'MEMBRO' THEN 'Seu convite foi aceito. Explore os deals exclusivos!'
      WHEN 'PARCEIRO' THEN 'Você agora é parceiro MAIS VANTA. Gerencie seus deals!'
    END,
    false,
    now()
  );

  RETURN v_result;
END;
$$;

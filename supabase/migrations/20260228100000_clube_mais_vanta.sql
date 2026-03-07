-- ══════════════════════════════════════════════════════════════════════════════
-- Clube de Influência (MAIS VANTA) — 4 tabelas
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Membros do Clube
CREATE TABLE IF NOT EXISTS membros_clube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE')),
  instagram_handle TEXT,
  instagram_seguidores INT,
  aprovado_por UUID NOT NULL,
  aprovado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  convidado_por UUID,
  ativo BOOLEAN NOT NULL DEFAULT true,
  instagram_verificado_em TIMESTAMPTZ, -- última verificação automática (Instagram Graph API futura)
  UNIQUE (user_id)
);

-- 2. Lotes MAIS VANTA (benefícios por evento)
CREATE TABLE IF NOT EXISTS lotes_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  tier_minimo TEXT NOT NULL CHECK (tier_minimo IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE')),
  quantidade INT NOT NULL DEFAULT 0,
  reservados INT NOT NULL DEFAULT 0,
  prazo TIMESTAMPTZ,
  descricao TEXT,
  com_acompanhante BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (evento_id)
);

-- 3. Reservas MAIS VANTA
CREATE TABLE IF NOT EXISTS reservas_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lote_mais_vanta_id UUID NOT NULL REFERENCES lotes_mais_vanta(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reservado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'RESERVADO' CHECK (status IN ('RESERVADO', 'USADO', 'CANCELADO', 'PENDENTE_POST')),
  post_verificado BOOLEAN NOT NULL DEFAULT false,
  post_url TEXT
);

-- 4. Solicitações de entrada no Clube
CREATE TABLE IF NOT EXISTS solicitacoes_clube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_handle TEXT NOT NULL,
  instagram_seguidores INT,
  convidado_por UUID,
  status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID,
  tier_atribuido TEXT CHECK (tier_atribuido IS NULL OR tier_atribuido IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE'))
);

-- RLS
ALTER TABLE membros_clube ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_mais_vanta ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas_mais_vanta ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_clube ENABLE ROW LEVEL SECURITY;

-- Policies: leitura pública, escrita autenticada
CREATE POLICY "membros_clube_select" ON membros_clube FOR SELECT USING (true);
CREATE POLICY "membros_clube_all" ON membros_clube FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "lotes_mais_vanta_select" ON lotes_mais_vanta FOR SELECT USING (true);
CREATE POLICY "lotes_mais_vanta_all" ON lotes_mais_vanta FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "reservas_mais_vanta_select" ON reservas_mais_vanta FOR SELECT USING (true);
CREATE POLICY "reservas_mais_vanta_all" ON reservas_mais_vanta FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "solicitacoes_clube_select" ON solicitacoes_clube FOR SELECT USING (true);
CREATE POLICY "solicitacoes_clube_all" ON solicitacoes_clube FOR ALL USING (auth.uid() IS NOT NULL);

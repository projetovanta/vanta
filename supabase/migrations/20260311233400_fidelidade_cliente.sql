-- fidelidade_cliente — pontos de fidelidade por usuário/comunidade
-- Usado pelo Motor de Valor VANTA (Módulo C: Programa de Fidelidade)
-- Tiers: NENHUM (0-2pts), BRONZE (3-4pts), PRATA (5-9pts), OURO (10+pts)

CREATE TABLE fidelidade_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comunidade_id UUID NOT NULL REFERENCES comunidades(id) ON DELETE CASCADE,
  pontos INTEGER DEFAULT 0 CHECK (pontos >= 0),
  tier TEXT DEFAULT 'NENHUM' CHECK (tier IN ('NENHUM', 'BRONZE', 'PRATA', 'OURO')),
  ultimo_evento_id UUID REFERENCES eventos_admin(id),
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comunidade_id)
);

CREATE INDEX idx_fidelidade_comunidade ON fidelidade_cliente(comunidade_id);
CREATE INDEX idx_fidelidade_tier ON fidelidade_cliente(comunidade_id, tier);
CREATE INDEX idx_fidelidade_pontos ON fidelidade_cliente(comunidade_id, pontos DESC);

-- RLS
ALTER TABLE fidelidade_cliente ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "fidelidade_admin_all" ON fidelidade_cliente
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
  );

-- Usuário pode ver seus próprios dados
CREATE POLICY "fidelidade_select_own" ON fidelidade_cliente
  FOR SELECT USING (auth.uid() = user_id);

-- Membro da comunidade pode ver fidelidade
CREATE POLICY "fidelidade_select_member" ON fidelidade_cliente
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_follows
      WHERE comunidade_id = fidelidade_cliente.comunidade_id
        AND user_id = auth.uid()
    )
  );

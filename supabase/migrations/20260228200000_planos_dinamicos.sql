-- Planos dinâmicos MAIS VANTA (master cria/edita)
CREATE TABLE IF NOT EXISTS planos_mais_vanta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  preco_mensal NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite_eventos_mv INT NOT NULL DEFAULT 5,
  limite_membros INT NOT NULL DEFAULT 50,
  limite_vagas_evento INT NOT NULL DEFAULT 10,
  tier_minimo TEXT NOT NULL DEFAULT 'BRONZE',
  acompanhante BOOLEAN NOT NULL DEFAULT false,
  prazo_post_horas INT NOT NULL DEFAULT 12,
  dias_castigo INT NOT NULL DEFAULT 30,
  preco_avulso NUMERIC(10,2) NOT NULL DEFAULT 79,
  ativo BOOLEAN NOT NULL DEFAULT true,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ordem INT NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Tiers dinâmicos (master configura)
CREATE TABLE IF NOT EXISTS tiers_mais_vanta (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#CD7F32',
  ordem INT NOT NULL DEFAULT 1,
  beneficios TEXT[] NOT NULL DEFAULT '{}',
  limite_mensal INT NOT NULL DEFAULT 5,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Seed tiers padrão
INSERT INTO tiers_mais_vanta (id, nome, cor, ordem, beneficios, limite_mensal) VALUES
  ('BRONZE', 'Bronze', '#CD7F32', 1, ARRAY['INGRESSO_CORTESIA'], 2),
  ('PRATA', 'Prata', '#C0C0C0', 2, ARRAY['INGRESSO_CORTESIA','PRIORIDADE'], 5),
  ('OURO', 'Ouro', '#FFD300', 3, ARRAY['INGRESSO_CORTESIA','ACOMPANHANTE','PRIORIDADE','RESERVA_ANTECIPADA'], 10),
  ('DIAMANTE', 'Diamante', '#B9F2FF', 4, ARRAY['INGRESSO_CORTESIA','ACOMPANHANTE','PRIORIDADE','RESERVA_ANTECIPADA','PASSPORT_GLOBAL'], -1)
ON CONFLICT (id) DO NOTHING;

-- Seed planos padrão
INSERT INTO planos_mais_vanta (nome, descricao, preco_mensal, limite_eventos_mv, limite_membros, limite_vagas_evento, tier_minimo, preco_avulso, ordem, destaque) VALUES
  ('Básico', 'Ideal para começar', 199, 5, 50, 10, 'BRONZE', 99, 1, false),
  ('Pro', 'Mais eventos e membros', 499, 15, 200, 20, 'BRONZE', 59, 2, true),
  ('Enterprise', 'Sem limites', 999, -1, -1, 50, 'BRONZE', 0, 3, false);

-- Colunas novas em assinaturas_mais_vanta
ALTER TABLE assinaturas_mais_vanta ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES planos_mais_vanta(id);
ALTER TABLE assinaturas_mais_vanta ADD COLUMN IF NOT EXISTS plano_snapshot JSONB;
ALTER TABLE assinaturas_mais_vanta ADD COLUMN IF NOT EXISTS eventos_mv_usados INT DEFAULT 0;

-- RLS planos
ALTER TABLE planos_mais_vanta ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'planos_read' AND tablename = 'planos_mais_vanta') THEN
    CREATE POLICY "planos_read" ON planos_mais_vanta FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'planos_write' AND tablename = 'planos_mais_vanta') THEN
    CREATE POLICY "planos_write" ON planos_mais_vanta FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    );
  END IF;
END $$;

-- RLS tiers
ALTER TABLE tiers_mais_vanta ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tiers_read' AND tablename = 'tiers_mais_vanta') THEN
    CREATE POLICY "tiers_read" ON tiers_mais_vanta FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tiers_write' AND tablename = 'tiers_mais_vanta') THEN
    CREATE POLICY "tiers_write" ON tiers_mais_vanta FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
    );
  END IF;
END $$;

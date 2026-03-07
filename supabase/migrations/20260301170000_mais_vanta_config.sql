-- ══════════════════════════════════════════════════════════════════════════════
-- MAIS VANTA — Configuração global dinâmica (master edita sem deploy)
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Tabela singleton global
CREATE TABLE IF NOT EXISTS mais_vanta_config (
  id TEXT PRIMARY KEY DEFAULT 'global',

  -- Branding
  nome_programa TEXT NOT NULL DEFAULT 'MAIS VANTA',
  descricao_programa TEXT NOT NULL DEFAULT 'Experiências exclusivas em troca de visibilidade nas redes sociais',
  email_contato TEXT NOT NULL DEFAULT 'contato@maisvanta.com',

  -- Regras
  prazo_post_horas INT NOT NULL DEFAULT 12,
  mencoes_obrigatorias TEXT[] NOT NULL DEFAULT '{@maisvanta}',
  hashtags_obrigatorias TEXT[] NOT NULL DEFAULT '{#publi,#parceria}',
  infracoes_limite INT NOT NULL DEFAULT 3,
  bloqueio1_dias INT NOT NULL DEFAULT 30,
  bloqueio2_dias INT NOT NULL DEFAULT 60,

  -- Textos customizáveis (JSONB arrays de {titulo, descricao})
  vantagens_membro JSONB NOT NULL DEFAULT '[
    {"titulo":"Acesso Exclusivo","descricao":"Entrada gratuita em eventos selecionados da sua cidade"},
    {"titulo":"Rede de Influência","descricao":"Conecte-se com outros criadores e amplie seu alcance"},
    {"titulo":"Prioridade VIP","descricao":"Reservas antecipadas e tratamento diferenciado"},
    {"titulo":"Acompanhantes","descricao":"Leve amigos para viver a experiência com você"},
    {"titulo":"Multicicidade","descricao":"Passaporte regional para explorar eventos em outras cidades"}
  ]'::jsonb,

  vantagens_venue JSONB NOT NULL DEFAULT '[
    {"titulo":"Influenciadores Reais","descricao":"Atraia criadores verificados para seus eventos"},
    {"titulo":"Visibilidade Orgânica","descricao":"Posts garantidos com menção e hashtags"},
    {"titulo":"Zero Risco","descricao":"Pague apenas pelo plano, sem custos extras por membro"},
    {"titulo":"Curadoria VANTA","descricao":"Membros verificados e rankeados por alcance"},
    {"titulo":"Dashboard Completo","descricao":"Métricas de alcance, posts e ROI em tempo real"}
  ]'::jsonb,

  termos_customizados TEXT DEFAULT NULL,

  -- Benefícios dinâmicos (substituem BeneficioId hardcoded)
  beneficios_disponiveis JSONB NOT NULL DEFAULT '[
    {"id":"INGRESSO_CORTESIA","label":"Ingresso Cortesia","descricao":"Entrada gratuita no evento"},
    {"id":"ACOMPANHANTE","label":"Acompanhante","descricao":"Levar acompanhante(s)"},
    {"id":"PRIORIDADE","label":"Prioridade","descricao":"Fila prioritária e acesso antecipado"},
    {"id":"RESERVA_ANTECIPADA","label":"Reserva Antecipada","descricao":"Reservar antes da abertura geral"},
    {"id":"PASSPORT_GLOBAL","label":"Passport Regional","descricao":"Acesso a eventos em outras cidades"}
  ]'::jsonb,

  -- Meta
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_por UUID
);

-- 2. RLS
ALTER TABLE mais_vanta_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mvconfig_read' AND tablename = 'mais_vanta_config') THEN
    CREATE POLICY "mvconfig_read" ON mais_vanta_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mvconfig_write' AND tablename = 'mais_vanta_config') THEN
    CREATE POLICY "mvconfig_write" ON mais_vanta_config FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());
  END IF;
END $$;

-- 3. Seed global
INSERT INTO mais_vanta_config (id) VALUES ('global') ON CONFLICT DO NOTHING;

-- 4. Fix: adicionar colunas faltantes em clube_config (infrações)
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS infracoes_limite INT DEFAULT 3;
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS bloqueio1_dias INT DEFAULT 30;
ALTER TABLE clube_config ADD COLUMN IF NOT EXISTS bloqueio2_dias INT DEFAULT 60;

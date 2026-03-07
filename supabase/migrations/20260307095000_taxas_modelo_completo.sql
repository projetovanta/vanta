-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: Modelo completo de taxas VANTA
-- Novos campos em comunidades (defaults) e eventos_admin (override por evento)
-- Campos existentes mantidos para compatibilidade (vanta_fee_percent, vanta_fee_fixed, gateway_fee_mode)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── COMUNIDADES (defaults da casa) ──────────────────────────────────────────

-- Taxa de processamento (gateway), sempre do produtor
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS taxa_processamento_percent NUMERIC(5,4) DEFAULT 0.025;

-- Taxa sobre vendas na porta (caixa + lista pagante)
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS taxa_porta_percent NUMERIC(5,4);

-- Valor mínimo de taxa por ingresso no app
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS taxa_minima NUMERIC(10,2) DEFAULT 2.00;

-- Cota de nomes gratuitos na lista
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cota_nomes_lista INTEGER DEFAULT 500;

-- Valor por nome excedente na lista
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS taxa_nome_excedente NUMERIC(10,2) DEFAULT 0.50;

-- Cota de cortesias gratuitas
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cota_cortesias INTEGER DEFAULT 50;

-- Taxa sobre cortesias excedentes (% do valor face)
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS taxa_cortesia_excedente_pct NUMERIC(5,4) DEFAULT 0.05;

-- ── EVENTOS_ADMIN (override por evento, NULL = herda comunidade) ────────────

-- Taxa de processamento
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_processamento_percent NUMERIC(5,4);

-- Taxa sobre vendas na porta
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_porta_percent NUMERIC(5,4);

-- Valor mínimo por ingresso
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_minima NUMERIC(10,2);

-- Taxa fixa do evento (custo fixo independente de receita)
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_fixa_evento NUMERIC(10,2) DEFAULT 0;

-- Quem paga taxa de serviço: PRODUTOR_ABSORVE, COMPRADOR_PAGA, PRODUTOR_ESCOLHE
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS quem_paga_servico TEXT DEFAULT 'PRODUTOR_ESCOLHE';

-- Cota de nomes gratuitos na lista
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS cota_nomes_lista INTEGER;

-- Valor por nome excedente
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_nome_excedente NUMERIC(10,2);

-- Cota de cortesias gratuitas
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS cota_cortesias INTEGER;

-- Taxa sobre cortesias excedentes
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS taxa_cortesia_excedente_pct NUMERIC(5,4);

-- Prazo de pagamento em dias após evento
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS prazo_pagamento_dias INTEGER;

-- ── COMENTÁRIOS ─────────────────────────────────────────────────────────────

COMMENT ON COLUMN comunidades.taxa_processamento_percent IS 'Taxa de processamento gateway (default 2.5%), sempre do produtor';
COMMENT ON COLUMN comunidades.taxa_porta_percent IS 'Taxa sobre vendas na porta. NULL = mesma que vanta_fee_percent';
COMMENT ON COLUMN comunidades.taxa_minima IS 'Valor mínimo de taxa por ingresso no app (default R$2)';
COMMENT ON COLUMN comunidades.cota_nomes_lista IS 'Nomes gratuitos na lista por evento (default 500)';
COMMENT ON COLUMN comunidades.taxa_nome_excedente IS 'R$ por nome acima da cota (default R$0,50)';
COMMENT ON COLUMN comunidades.cota_cortesias IS 'Cortesias gratuitas por evento (default 50)';
COMMENT ON COLUMN comunidades.taxa_cortesia_excedente_pct IS '% do valor face por cortesia excedente (default 5%)';

COMMENT ON COLUMN eventos_admin.taxa_processamento_percent IS 'Override: taxa processamento. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.taxa_porta_percent IS 'Override: taxa porta. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.taxa_minima IS 'Override: mínimo por ingresso. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.taxa_fixa_evento IS 'Custo fixo do evento (independente de receita). Default 0';
COMMENT ON COLUMN eventos_admin.quem_paga_servico IS 'PRODUTOR_ABSORVE | COMPRADOR_PAGA | PRODUTOR_ESCOLHE';
COMMENT ON COLUMN eventos_admin.cota_nomes_lista IS 'Override: cota nomes lista. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.taxa_nome_excedente IS 'Override: R$/nome excedente. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.cota_cortesias IS 'Override: cota cortesias. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.taxa_cortesia_excedente_pct IS 'Override: % cortesia excedente. NULL = herda comunidade';
COMMENT ON COLUMN eventos_admin.prazo_pagamento_dias IS 'Dias após evento para acerto. NULL = a negociar';

-- ============================================================================
-- Migration: slug para evento + comissão de promoter + pagamentos a promoter
-- ============================================================================

-- 1. Slug público para eventos (landing page /evento/{slug})
ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_eventos_admin_slug ON eventos_admin (slug) WHERE slug IS NOT NULL;

-- 2. Comissão de promoter nas cotas
ALTER TABLE cotas_promoter
  ADD COLUMN IF NOT EXISTS comissao_tipo TEXT CHECK (comissao_tipo IN ('PERCENTUAL', 'FIXO')),
  ADD COLUMN IF NOT EXISTS comissao_valor NUMERIC DEFAULT 0;

-- 3. Tabela de pagamentos a promoter
CREATE TABLE IF NOT EXISTS pagamentos_promoter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cota_id UUID NOT NULL REFERENCES cotas_promoter(id) ON DELETE CASCADE,
  promoter_id UUID NOT NULL REFERENCES auth.users(id),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  valor NUMERIC NOT NULL,
  data TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_por UUID NOT NULL REFERENCES auth.users(id),
  observacao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para busca por evento
CREATE INDEX IF NOT EXISTS idx_pagamentos_promoter_evento ON pagamentos_promoter (evento_id);

-- 4. Política de reembolso configurável por evento
ALTER TABLE eventos_admin
  ADD COLUMN IF NOT EXISTS politica_reembolso TEXT,
  ADD COLUMN IF NOT EXISTS prazo_reembolso_dias INTEGER DEFAULT 7;

-- RLS para pagamentos_promoter
ALTER TABLE pagamentos_promoter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagamentos_promoter_select" ON pagamentos_promoter
  FOR SELECT USING (true);

CREATE POLICY "pagamentos_promoter_insert" ON pagamentos_promoter
  FOR INSERT WITH CHECK (true);

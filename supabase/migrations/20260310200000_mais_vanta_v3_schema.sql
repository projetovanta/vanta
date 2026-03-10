-- ============================================================
-- MAIS VANTA v3 — Reestruturação schema
-- ============================================================
-- 1. Tier DESCONTO (ordem 0)
-- 2. membros_clube: status, nota_interna, tags
-- 3. solicitacoes_clube: profissao, como_conheceu, status CONVIDADO
-- 4. Nova tabela mais_vanta_lotes_evento (substitui lotes_mais_vanta)
-- 5. Drop lotes_mais_vanta + reservas_mais_vanta (ambas vazias)
-- 6. Migrar tags_curadoria → membros_clube.tags + dropar coluna
-- ============================================================

BEGIN;

-- ── 1. Tier DESCONTO ────────────────────────────────────────

INSERT INTO tiers_mais_vanta (id, nome, cor, ordem)
VALUES ('DESCONTO', 'Desconto', '#6B7280', 0)
ON CONFLICT (id) DO NOTHING;

-- Atualizar constraints de tier em TODAS as tabelas relevantes

ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_tier_check;
ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_tier_check
  CHECK (tier IN ('DESCONTO','CONVIDADO','PRESENCA','CREATOR','VANTA_BLACK'));

ALTER TABLE lotes_mais_vanta DROP CONSTRAINT IF EXISTS lotes_mais_vanta_tier_minimo_check;
ALTER TABLE lotes_mais_vanta ADD CONSTRAINT lotes_mais_vanta_tier_minimo_check
  CHECK (tier_minimo IN ('DESCONTO','CONVIDADO','PRESENCA','CREATOR','VANTA_BLACK'));

ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_tier_atribuido_check;
ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_tier_atribuido_check
  CHECK (tier_atribuido IS NULL OR tier_atribuido IN ('DESCONTO','CONVIDADO','PRESENCA','CREATOR','VANTA_BLACK'));

-- convites_mais_vanta.tier (nullable, sem constraint explícita de tier — verificar)
-- Não tem constraint de tier, mas tier_pre_atribuido em solicitacoes sim (já coberto acima)

-- ── 2. membros_clube: novos campos ─────────────────────────

-- status (PENDENTE/APROVADO/REJEITADO/BLOQUEADO/BANIDO)
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'APROVADO';
ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_status_check
  CHECK (status IN ('PENDENTE','APROVADO','REJEITADO','BLOQUEADO','BANIDO'));

-- nota_interna (nunca visível ao membro)
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS nota_interna text;

-- tags internas (array padronizado, nunca visível ao membro)
ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Migrar tags_curadoria de profiles para membros_clube.tags (onde membro existe)
UPDATE membros_clube mc
SET tags = p.tags_curadoria
FROM profiles p
WHERE mc.user_id = p.id
  AND p.tags_curadoria IS NOT NULL
  AND array_length(p.tags_curadoria, 1) > 0
  AND (mc.tags IS NULL OR mc.tags = '{}');

-- ── 3. solicitacoes_clube: novos campos + constraint ────────

ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS profissao text;
ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS como_conheceu text;

-- Atualizar constraint de status para incluir CONVIDADO
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_status_check;
ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_status_check
  CHECK (status IN ('PENDENTE','APROVADO','REJEITADO','CONVIDADO'));

-- ── 4. Nova tabela mais_vanta_lotes_evento ──────────────────

CREATE TABLE IF NOT EXISTS mais_vanta_lotes_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  tier_minimo text NOT NULL CHECK (tier_minimo IN ('DESCONTO','CONVIDADO','PRESENCA','CREATOR','VANTA_BLACK')),
  tipo text NOT NULL CHECK (tipo IN ('ingresso', 'lista')),
  lote_id uuid REFERENCES lotes(id) ON DELETE SET NULL,
  lista_id uuid REFERENCES listas_evento(id) ON DELETE SET NULL,
  desconto_percentual int CHECK (desconto_percentual IS NULL OR desconto_percentual BETWEEN 0 AND 100),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Garantir que lote_id OU lista_id é preenchido conforme tipo
  CONSTRAINT tipo_referencia_check CHECK (
    (tipo = 'ingresso' AND lote_id IS NOT NULL AND lista_id IS NULL) OR
    (tipo = 'lista' AND lista_id IS NOT NULL AND lote_id IS NULL)
  )
);

-- RLS
ALTER TABLE mais_vanta_lotes_evento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mais_vanta_lotes_evento_select" ON mais_vanta_lotes_evento
  FOR SELECT USING (true);

CREATE POLICY "mais_vanta_lotes_evento_write" ON mais_vanta_lotes_evento
  FOR ALL USING (is_masteradm() OR is_produtor_evento(evento_id))
  WITH CHECK (is_masteradm() OR is_produtor_evento(evento_id));

-- Índice para lookup rápido por evento
CREATE INDEX IF NOT EXISTS idx_mvle_evento ON mais_vanta_lotes_evento(evento_id);

-- ── 5. Drop tabelas antigas (ambas vazias) ──────────────────

-- reservas_mais_vanta tem FK para lotes_mais_vanta, dropar primeiro
DROP TABLE IF EXISTS reservas_mais_vanta;
DROP TABLE IF EXISTS lotes_mais_vanta;

-- ── 6. Drop coluna tags_curadoria de profiles ───────────────
-- (1 perfil tinha ["INFLU500+"] mas não é membro do clube — tag descartada)

ALTER TABLE profiles DROP COLUMN IF EXISTS tags_curadoria;

-- Dropar constraint obsoleta de categoria (vai ser repensada)
ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_categoria_check;

COMMIT;

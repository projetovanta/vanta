-- ══════════════════════════════════════════════════════════════════════════════
-- Passport Regional — passaportes por cidade (não por comunidade)
-- Date: 2026-03-01
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Adicionar coluna cidade ao passport
ALTER TABLE passport_aprovacoes ADD COLUMN IF NOT EXISTS cidade TEXT;

-- 2. Tornar comunidade_id nullable (retrocompat)
ALTER TABLE passport_aprovacoes ALTER COLUMN comunidade_id DROP NOT NULL;

-- 3. Trocar constraint unique: de (user_id, comunidade_id) para (user_id, cidade)
ALTER TABLE passport_aprovacoes DROP CONSTRAINT IF EXISTS passport_aprovacoes_user_id_comunidade_id_key;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'passport_aprovacoes_user_id_cidade_key') THEN
    ALTER TABLE passport_aprovacoes ADD CONSTRAINT passport_aprovacoes_user_id_cidade_key UNIQUE (user_id, cidade);
  END IF;
END $$;

-- 4. Preencher cidade dos passports existentes a partir da comunidade
UPDATE passport_aprovacoes pa
SET cidade = c.cidade
FROM comunidades c
WHERE pa.comunidade_id = c.id
  AND pa.cidade IS NULL
  AND c.cidade IS NOT NULL
  AND c.cidade <> '';

-- 5. Tier mínimo por comunidade (para elegibilidade MAIS VANTA)
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS tier_minimo_mais_vanta TEXT DEFAULT 'BRONZE'
  CHECK (tier_minimo_mais_vanta IS NULL OR tier_minimo_mais_vanta IN ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE'));

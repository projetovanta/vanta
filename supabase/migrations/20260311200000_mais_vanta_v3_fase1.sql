-- ═══════════════════════════════════════════════════════════════════════════════
-- MAIS VANTA V3 — Fase 1: Base de dados e curadoria
-- ═══════════════════════════════════════════════════════════════════════════════
-- Tiers: desconto→lista, convidado→REMOVIDO, presenca(mantém), social(NOVO),
--         creator(mantém), vanta_black→black
-- Status membros: PENDENTE, APROVADO (remove REJEITADO, BLOQUEADO, BANIDO)
-- Status solicitações: PENDENTE, APROVADO, ADIADO (remove REJEITADO, CONVIDADO)
-- Novas colunas: creator_sublevel, cidade_principal, cidades_ativas,
--                convites_disponiveis, convites_usados, balde_sugerido
-- Renomeia: mais_vanta_lotes_evento → mais_vanta_config_evento
-- Nova tabela: convites_clube (indicação membro→membro)
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. DROPAR CHECK CONSTRAINTS ANTIGOS (ANTES de atualizar dados)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_tier_check;
ALTER TABLE membros_clube DROP CONSTRAINT IF EXISTS membros_clube_status_check;
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_tier_atribuido_check;
ALTER TABLE solicitacoes_clube DROP CONSTRAINT IF EXISTS solicitacoes_clube_status_check;
ALTER TABLE mais_vanta_lotes_evento DROP CONSTRAINT IF EXISTS mais_vanta_lotes_evento_tier_minimo_check;
ALTER TABLE mais_vanta_lotes_evento DROP CONSTRAINT IF EXISTS mais_vanta_lotes_evento_tipo_check;
ALTER TABLE comunidades DROP CONSTRAINT IF EXISTS comunidades_tier_minimo_mais_vanta_check;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ATUALIZAR DADOS EXISTENTES (sem constraints bloqueando)
-- ══════════════════════════════════════════════════════════════════════════════

-- membros_clube: renomear tiers nos dados
UPDATE membros_clube SET tier = 'lista' WHERE tier = 'desconto';
UPDATE membros_clube SET tier = 'lista' WHERE tier = 'convidado';
UPDATE membros_clube SET tier = 'black' WHERE tier = 'vanta_black';

-- membros_clube: limpar status legados → APROVADO
UPDATE membros_clube SET status = 'APROVADO' WHERE status IN ('REJEITADO', 'BLOQUEADO', 'BANIDO');

-- solicitacoes_clube: renomear tiers
UPDATE solicitacoes_clube SET tier_atribuido = 'lista' WHERE tier_atribuido IN ('desconto', 'convidado');
UPDATE solicitacoes_clube SET tier_atribuido = 'black' WHERE tier_atribuido = 'vanta_black';
UPDATE solicitacoes_clube SET tier_pre_atribuido = 'lista' WHERE tier_pre_atribuido IN ('desconto', 'convidado');
UPDATE solicitacoes_clube SET tier_pre_atribuido = 'black' WHERE tier_pre_atribuido = 'vanta_black';

-- solicitacoes_clube: limpar status legados
UPDATE solicitacoes_clube SET status = 'APROVADO' WHERE status = 'REJEITADO';
UPDATE solicitacoes_clube SET status = 'APROVADO' WHERE status = 'CONVIDADO';

-- mais_vanta_lotes_evento: renomear tiers
UPDATE mais_vanta_lotes_evento SET tier_minimo = 'lista' WHERE tier_minimo IN ('desconto', 'convidado');
UPDATE mais_vanta_lotes_evento SET tier_minimo = 'black' WHERE tier_minimo = 'vanta_black';

-- comunidades: renomear tier
UPDATE comunidades SET tier_minimo_mais_vanta = 'lista' WHERE tier_minimo_mais_vanta IN ('desconto', 'convidado');
UPDATE comunidades SET tier_minimo_mais_vanta = 'black' WHERE tier_minimo_mais_vanta = 'vanta_black';

-- convites_mais_vanta: renomear tiers
UPDATE convites_mais_vanta SET tier = 'lista' WHERE tier IN ('desconto', 'convidado');
UPDATE convites_mais_vanta SET tier = 'black' WHERE tier = 'vanta_black';

-- tiers_mais_vanta: deletar os 5 antigos e inserir os 5 novos do V3
-- Colunas reais: id, nome, cor, ordem, beneficios, limite_mensal, ativo, criado_em
DELETE FROM tiers_mais_vanta;
INSERT INTO tiers_mais_vanta (id, nome, cor, ordem, ativo)
VALUES
  ('lista',    'Lista',    '#888888', 0, true),
  ('presenca', 'Presença', '#C0C0C0', 1, true),
  ('social',   'Social',   '#4A90D9', 2, true),
  ('creator',  'Creator',  '#FFD300', 3, true),
  ('black',    'Black',    '#1a1a1a', 4, true);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. NOVOS CHECK CONSTRAINTS (tiers V3)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_tier_check
  CHECK (tier IN ('lista','presenca','social','creator','black'));

ALTER TABLE membros_clube ADD CONSTRAINT membros_clube_status_check
  CHECK (status IN ('PENDENTE','APROVADO'));

ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_tier_atribuido_check
  CHECK (tier_atribuido IS NULL OR tier_atribuido IN ('lista','presenca','social','creator','black'));

ALTER TABLE solicitacoes_clube ADD CONSTRAINT solicitacoes_clube_status_check
  CHECK (status IN ('PENDENTE','APROVADO','ADIADO'));

ALTER TABLE mais_vanta_lotes_evento ADD CONSTRAINT mais_vanta_lotes_evento_tier_minimo_check
  CHECK (tier_minimo IN ('lista','presenca','social','creator','black'));

ALTER TABLE mais_vanta_lotes_evento ADD CONSTRAINT mais_vanta_lotes_evento_tipo_check
  CHECK (tipo IN ('ingresso','lista','desconto'));

ALTER TABLE comunidades ADD CONSTRAINT comunidades_tier_minimo_mais_vanta_check
  CHECK (tier_minimo_mais_vanta IS NULL OR tier_minimo_mais_vanta IN ('lista','presenca','social','creator','black'));

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. NOVAS COLUNAS EM membros_clube
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS creator_sublevel TEXT
  CHECK (creator_sublevel IS NULL OR creator_sublevel IN ('creator_200k','creator_500k','creator_1m'));

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS cidade_principal TEXT;

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS cidades_ativas TEXT[] DEFAULT '{}';

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS convites_disponiveis INT DEFAULT 0;

ALTER TABLE membros_clube ADD COLUMN IF NOT EXISTS convites_usados INT DEFAULT 0;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. NOVAS COLUNAS EM solicitacoes_clube
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS balde_sugerido TEXT;

ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS indicado_por UUID;

ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS convite_id UUID;

ALTER TABLE solicitacoes_clube ADD COLUMN IF NOT EXISTS cidade TEXT;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. RENOMEAR mais_vanta_lotes_evento → mais_vanta_config_evento
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE mais_vanta_lotes_evento RENAME TO mais_vanta_config_evento;

-- Novas colunas na tabela renomeada
ALTER TABLE mais_vanta_config_evento ADD COLUMN IF NOT EXISTS creator_sublevel_minimo TEXT
  CHECK (creator_sublevel_minimo IS NULL OR creator_sublevel_minimo IN ('creator_200k','creator_500k','creator_1m'));

ALTER TABLE mais_vanta_config_evento ADD COLUMN IF NOT EXISTS vagas_limite INT;

ALTER TABLE mais_vanta_config_evento ADD COLUMN IF NOT EXISTS vagas_resgatadas INT DEFAULT 0;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. NOVA TABELA: convites_clube (indicação membro → membro)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS convites_clube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID NOT NULL REFERENCES profiles(id),
  codigo TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  usado_por UUID REFERENCES profiles(id),
  usado_em TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel','usado','expirado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE convites_clube ENABLE ROW LEVEL SECURITY;

-- Membro vê seus próprios convites
CREATE POLICY "convites_clube_own_read" ON convites_clube
  FOR SELECT USING (auth.uid() = membro_id);

-- Qualquer logado pode ler convite por código (pra aceitar)
CREATE POLICY "convites_clube_public_read" ON convites_clube
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Membro pode inserir (gerar convite)
CREATE POLICY "convites_clube_own_insert" ON convites_clube
  FOR INSERT WITH CHECK (auth.uid() = membro_id);

-- Master pode tudo
CREATE POLICY "convites_clube_master_all" ON convites_clube
  FOR ALL USING (is_masteradm()) WITH CHECK (is_masteradm());

-- Update (marcar como usado) — qualquer logado
CREATE POLICY "convites_clube_update" ON convites_clube
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. ATUALIZAR resgates_mv_evento — FK referenciava mais_vanta_lotes_evento
-- ══════════════════════════════════════════════════════════════════════════════
-- O RENAME da tabela propaga automaticamente as FKs no PostgreSQL.
-- Apenas renomear a constraint pra clareza se existir:
ALTER INDEX IF EXISTS mais_vanta_lotes_evento_pkey RENAME TO mais_vanta_config_evento_pkey;

COMMIT;

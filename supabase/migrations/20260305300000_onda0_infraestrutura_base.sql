-- Onda 0 — Infraestrutura Base para Fluxo Completo
-- Novos campos para comunidades, audit_logs, profiles, cortesias, reembolsos, saques

-- ── 1. Comunidades: CNPJ, Razão Social, Telefone, Split taxa ──
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS vanta_fee_repasse_percent NUMERIC(5,2) DEFAULT 0;

-- ── 2. Audit Logs: nome completo do ator ──
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_name TEXT;

-- ── 3. Profiles: aceite de ToS ──
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tos_version TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tos_ip TEXT;

-- ── 4. Cortesias: nome do convidado final (trava de transferência) ──
ALTER TABLE cortesias_pendentes ADD COLUMN IF NOT EXISTS nome_convidado TEXT;
ALTER TABLE cortesias_pendentes ADD COLUMN IF NOT EXISTS delegado_por UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- ── 5. Reembolsos: hierarquia + anti-fraude ──
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS etapa TEXT DEFAULT 'SOLICITADO';
-- etapas: SOLICITADO → SOCIO_ANALISOU → GERENTE_AUTORIZOU → MASTER_DECIDIU
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS socio_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS socio_decisao TEXT;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS socio_decisao_em TIMESTAMPTZ;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS gerente_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS gerente_decisao TEXT;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS gerente_decisao_em TIMESTAMPTZ;
ALTER TABLE reembolsos ADD COLUMN IF NOT EXISTS comprador_nome TEXT;

-- Alterar CHECK de status para incluir novas etapas
ALTER TABLE reembolsos DROP CONSTRAINT IF EXISTS reembolsos_status_check;
ALTER TABLE reembolsos ADD CONSTRAINT reembolsos_status_check
  CHECK (status IN ('PENDENTE_APROVACAO', 'AGUARDANDO_SOCIO', 'AGUARDANDO_GERENTE', 'AGUARDANDO_MASTER', 'APROVADO', 'REJEITADO', 'AUTOMATICO_CDC'));

-- ── 6. Solicitações de Saque: hierarquia tripla ──
ALTER TABLE solicitacoes_saque ADD COLUMN IF NOT EXISTS etapa TEXT DEFAULT 'SOLICITADO';
-- etapas: SOLICITADO → GERENTE_AUTORIZOU → MASTER_DECIDIU
ALTER TABLE solicitacoes_saque ADD COLUMN IF NOT EXISTS gerente_aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE solicitacoes_saque ADD COLUMN IF NOT EXISTS gerente_aprovado_em TIMESTAMPTZ;
ALTER TABLE solicitacoes_saque ADD COLUMN IF NOT EXISTS motivo_recusa TEXT;

-- ── 7. Eventos: campo para cancelamento/adiamento ──
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS cancelamento_solicitado_por UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS cancelamento_motivo TEXT;
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS cancelamento_etapa TEXT;
-- etapas: SOLICITADO_SOCIO → GERENTE_AUTORIZOU → MASTER_DECIDIU

-- ── 8. Tabela de contagem de reembolsos (anti-fraude) ──
CREATE TABLE IF NOT EXISTS reembolsos_contagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mes_ano TEXT NOT NULL, -- formato: '2026-03'
  contagem INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, mes_ano)
);
ALTER TABLE reembolsos_contagem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reembolsos_contagem_select" ON reembolsos_contagem FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "reembolsos_contagem_insert" ON reembolsos_contagem FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reembolsos_contagem_update" ON reembolsos_contagem FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── 9. Índices ──
CREATE INDEX IF NOT EXISTS idx_reembolsos_etapa ON reembolsos(etapa);
CREATE INDEX IF NOT EXISTS idx_saques_etapa ON solicitacoes_saque(etapa);
CREATE INDEX IF NOT EXISTS idx_cortesias_nome_convidado ON cortesias_pendentes(nome_convidado);
CREATE INDEX IF NOT EXISTS idx_reembolsos_contagem_user ON reembolsos_contagem(user_id, mes_ano);

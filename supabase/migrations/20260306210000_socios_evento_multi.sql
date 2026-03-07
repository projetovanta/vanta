-- Migration: Suporte a N socios por evento (multi-socio)
-- Cria tabela socios_evento para substituir socio_convidado_id/split_produtor/split_socio em eventos_admin

-- ── Tabela socios_evento ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS socios_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  socio_id UUID NOT NULL REFERENCES auth.users(id),
  split_percentual INTEGER NOT NULL DEFAULT 0,
  permissoes TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  rodada_negociacao INTEGER DEFAULT 1,
  mensagem_negociacao TEXT,
  motivo_rejeicao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_socios_status CHECK (status IN ('PENDENTE', 'NEGOCIANDO', 'ACEITO', 'RECUSADO')),
  CONSTRAINT chk_split_percentual CHECK (split_percentual >= 0 AND split_percentual <= 100),
  CONSTRAINT uq_socio_evento UNIQUE (evento_id, socio_id)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_socios_evento_evento ON socios_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_socios_evento_socio ON socios_evento(socio_id);
CREATE INDEX IF NOT EXISTS idx_socios_evento_status ON socios_evento(status);

-- RLS
ALTER TABLE socios_evento ENABLE ROW LEVEL SECURITY;

-- Socio pode ver seus proprios convites
CREATE POLICY socios_evento_select_own ON socios_evento
  FOR SELECT TO authenticated
  USING (socio_id = auth.uid());

-- Criador do evento pode ver/gerenciar socios do seu evento
CREATE POLICY socios_evento_select_creator ON socios_evento
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = evento_id AND created_by = auth.uid()
  ));

CREATE POLICY socios_evento_insert_creator ON socios_evento
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = evento_id AND created_by = auth.uid()
  ));

CREATE POLICY socios_evento_update_creator ON socios_evento
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = evento_id AND created_by = auth.uid()
  ));

CREATE POLICY socios_evento_delete_creator ON socios_evento
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM eventos_admin WHERE id = evento_id AND created_by = auth.uid()
  ));

-- Socio pode atualizar seu proprio registro (aceitar/recusar/contraproposta)
CREATE POLICY socios_evento_update_own ON socios_evento
  FOR UPDATE TO authenticated
  USING (socio_id = auth.uid());

-- Admin full access
CREATE POLICY socios_evento_admin_all ON socios_evento
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM atribuicoes_rbac
    WHERE user_id = auth.uid() AND cargo IN ('master_admin', 'admin')
  ));

-- Migrar dados existentes de eventos_admin.socio_convidado_id para socios_evento
INSERT INTO socios_evento (evento_id, socio_id, split_percentual, status, rodada_negociacao, motivo_rejeicao)
SELECT
  id,
  socio_convidado_id,
  COALESCE(split_socio, 70),
  CASE status_evento
    WHEN 'NEGOCIANDO' THEN 'NEGOCIANDO'
    WHEN 'CANCELADO' THEN 'RECUSADO'
    ELSE 'ACEITO'
  END,
  COALESCE(rodada_negociacao, 1),
  motivo_rejeicao
FROM eventos_admin
WHERE socio_convidado_id IS NOT NULL
ON CONFLICT (evento_id, socio_id) DO NOTHING;

-- Adicionar split_produtor em eventos_admin como campo calculado (100 - soma dos splits dos socios)
-- As colunas legadas (socio_convidado_id, split_produtor, split_socio) permanecem para compatibilidade
-- mas o codigo passara a usar socios_evento como fonte primaria

COMMENT ON COLUMN eventos_admin.socio_convidado_id IS 'DEPRECATED: usar socios_evento. Mantido para retrocompatibilidade.';
COMMENT ON COLUMN eventos_admin.split_produtor IS 'DEPRECATED: usar socios_evento (100 - soma splits). Mantido para retrocompatibilidade.';
COMMENT ON COLUMN eventos_admin.split_socio IS 'DEPRECATED: usar socios_evento.split_percentual. Mantido para retrocompatibilidade.';

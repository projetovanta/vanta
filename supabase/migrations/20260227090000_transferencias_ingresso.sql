-- Transferências de Ingresso entre membros
CREATE TABLE IF NOT EXISTS transferencias_ingresso (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id         TEXT NOT NULL,
  evento_id         TEXT NOT NULL,
  remetente_id      UUID NOT NULL REFERENCES profiles(id),
  remetente_nome    TEXT NOT NULL,
  destinatario_id   UUID NOT NULL REFERENCES profiles(id),
  destinatario_nome TEXT NOT NULL,
  variacao_label    TEXT,
  titulo_evento     TEXT,
  data_evento       TEXT,
  evento_local      TEXT,
  evento_imagem     TEXT,
  status            TEXT NOT NULL DEFAULT 'PENDENTE',  -- PENDENTE | ACEITO | RECUSADO
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE transferencias_ingresso ENABLE ROW LEVEL SECURITY;

-- Remetente e destinatário podem ver
CREATE POLICY "transf_select" ON transferencias_ingresso FOR SELECT USING (
  auth.uid() = remetente_id OR auth.uid() = destinatario_id
);

-- Só remetente pode criar
CREATE POLICY "transf_insert" ON transferencias_ingresso FOR INSERT WITH CHECK (auth.uid() = remetente_id);

-- Só destinatário pode aceitar/recusar
CREATE POLICY "transf_update" ON transferencias_ingresso FOR UPDATE USING (auth.uid() = destinatario_id);

CREATE INDEX idx_transf_destinatario ON transferencias_ingresso(destinatario_id, status);

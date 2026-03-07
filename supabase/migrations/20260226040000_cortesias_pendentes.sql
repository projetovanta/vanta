-- Cortesias Pendentes — aceite/recusa pelo destinatário
CREATE TABLE IF NOT EXISTS cortesias_pendentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id TEXT NOT NULL,
  destinatario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  remetente_nome TEXT,
  evento_nome TEXT,
  evento_data TEXT,
  variacao_label TEXT,
  quantidade INT DEFAULT 1,
  status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','ACEITO','RECUSADO')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE cortesias_pendentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Destinatario can view own cortesias" ON cortesias_pendentes;
CREATE POLICY "Destinatario can view own cortesias"
  ON cortesias_pendentes FOR SELECT
  USING (auth.uid() = destinatario_id);

DROP POLICY IF EXISTS "Destinatario can update own cortesias" ON cortesias_pendentes;
CREATE POLICY "Destinatario can update own cortesias"
  ON cortesias_pendentes FOR UPDATE
  USING (auth.uid() = destinatario_id);

DROP POLICY IF EXISTS "Authenticated can insert cortesias" ON cortesias_pendentes;
CREATE POLICY "Authenticated can insert cortesias"
  ON cortesias_pendentes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

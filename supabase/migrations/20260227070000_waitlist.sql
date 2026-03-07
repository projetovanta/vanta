-- Waitlist / Lista de Espera
-- Captura demanda quando variação esgota

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  variacao_id UUID NOT NULL REFERENCES variacoes_ingresso(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  notificado_em TIMESTAMPTZ,
  UNIQUE(evento_id, variacao_id, email)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_select" ON waitlist FOR SELECT USING (true);
CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "waitlist_delete" ON waitlist FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm')
);

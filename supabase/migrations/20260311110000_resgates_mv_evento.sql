-- ============================================================
-- resgates_mv_evento — Substitui reservas_mais_vanta (dropada na v3)
-- ============================================================
-- Registra quando membro resgata benefício MV em evento.
-- Fluxo: membro confirma resgate → INSERT aqui → pós-evento cron verifica post.
-- ============================================================

CREATE TABLE IF NOT EXISTS resgates_mv_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id uuid NOT NULL REFERENCES mais_vanta_lotes_evento(id) ON DELETE CASCADE,
  evento_id uuid NOT NULL REFERENCES eventos_admin(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'RESGATADO'
    CHECK (status IN ('RESGATADO','USADO','PENDENTE_POST','NO_SHOW','CANCELADO')),
  post_verificado boolean NOT NULL DEFAULT false,
  post_url text,
  post_deadline_em timestamptz,
  infraction_registered_em timestamptz,
  resgatado_em timestamptz NOT NULL DEFAULT now(),
  cancelado_em timestamptz,
  UNIQUE(beneficio_id, user_id)
);

-- RLS
ALTER TABLE resgates_mv_evento ENABLE ROW LEVEL SECURITY;

-- Membro vê seus próprios resgates
CREATE POLICY "resgates_mv_evento_select_own" ON resgates_mv_evento
  FOR SELECT USING (auth.uid() = user_id);

-- Admin/produtor vê todos do evento
CREATE POLICY "resgates_mv_evento_select_admin" ON resgates_mv_evento
  FOR SELECT USING (is_masteradm() OR is_produtor_evento(evento_id));

-- Membro pode inserir (resgatar)
CREATE POLICY "resgates_mv_evento_insert_own" ON resgates_mv_evento
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin pode tudo
CREATE POLICY "resgates_mv_evento_all_admin" ON resgates_mv_evento
  FOR ALL USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- Índices
CREATE INDEX IF NOT EXISTS idx_resgates_mv_evento_evento ON resgates_mv_evento(evento_id);
CREATE INDEX IF NOT EXISTS idx_resgates_mv_evento_user ON resgates_mv_evento(user_id);
CREATE INDEX IF NOT EXISTS idx_resgates_mv_evento_status ON resgates_mv_evento(status);

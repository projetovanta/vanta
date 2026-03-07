-- ══════════════════════════════════════════════════════════════════════════════
-- Comprovante de Meia-Entrada — perfil centralizado + aprovação master
-- Tipos legais: ESTUDANTE (CIE/DNE), IDOSO (60+), PCD, ID_JOVEM, PROFESSOR,
--               DOADOR_SANGUE, custom
-- Date: 2026-03-02
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Tabela de comprovantes (1 ativo por usuário)
CREATE TABLE IF NOT EXISTS comprovantes_meia (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo            TEXT          NOT NULL,
  foto_url        TEXT          NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'PENDENTE'
                    CHECK (status IN ('PENDENTE','APROVADO','REJEITADO','VENCIDO')),
  motivo_rejeicao TEXT,
  aprovado_por    UUID          REFERENCES profiles(id),
  aprovado_em     TIMESTAMPTZ,
  validade_ate    TIMESTAMPTZ,
  criado_em       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  atualizado_em   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_comprovantes_status    ON comprovantes_meia(status);
CREATE INDEX IF NOT EXISTS idx_comprovantes_validade  ON comprovantes_meia(validade_ate);

-- RLS
ALTER TABLE comprovantes_meia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comprovantes_select_own_or_master"
  ON comprovantes_meia FOR SELECT
  USING (user_id = auth.uid() OR is_masteradm());

CREATE POLICY "comprovantes_insert_own"
  ON comprovantes_meia FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comprovantes_update_own_or_master"
  ON comprovantes_meia FOR UPDATE
  USING (user_id = auth.uid() OR is_masteradm());

-- 2. Flag na variação de ingresso
ALTER TABLE variacoes_ingresso
  ADD COLUMN IF NOT EXISTS requer_comprovante BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE variacoes_ingresso
  ADD COLUMN IF NOT EXISTS tipo_comprovante TEXT;

-- 3. Referência no ticket
ALTER TABLE tickets_caixa
  ADD COLUMN IF NOT EXISTS comprovante_id UUID REFERENCES comprovantes_meia(id);

-- 4. Storage bucket (privado — signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-meia', 'comprovantes-meia', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "comprovantes_storage_own_or_master"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'comprovantes-meia'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR is_masteradm()
    )
  );

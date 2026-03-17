-- Comprovante de pagamento do saque
-- Master anexa comprovante PIX ao confirmar saque

ALTER TABLE solicitacoes_saque
  ADD COLUMN IF NOT EXISTS comprovante_url TEXT;

COMMENT ON COLUMN solicitacoes_saque.comprovante_url IS 'URL do comprovante de pagamento (imagem/PDF no Storage)';

-- Bucket para comprovantes de saque
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-saque', 'comprovantes-saque', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: master pode fazer upload
CREATE POLICY "master_upload_comprovante_saque"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'comprovantes-saque');

-- RLS: produtor e master podem ver
CREATE POLICY "auth_read_comprovante_saque"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'comprovantes-saque');

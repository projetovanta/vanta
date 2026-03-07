-- ══════════════════════════════════════════════════════════════════════════════
-- Comunidade: coluna CEP + bucket Storage para fotos
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Coluna CEP
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cep TEXT;

-- 2. Bucket público para fotos de comunidade (perfil + capa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comunidades', 'comunidades', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: qualquer autenticado pode fazer upload (admin cria comunidade)
CREATE POLICY "Authenticated users can upload comunidade photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'comunidades');

-- 4. RLS: leitura pública (fotos de comunidade são públicas)
CREATE POLICY "Public can read comunidade photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'comunidades');

-- 5. RLS: autenticados podem atualizar/deletar (para trocar fotos)
CREATE POLICY "Authenticated users can update comunidade photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'comunidades');

CREATE POLICY "Authenticated users can delete comunidade photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'comunidades');

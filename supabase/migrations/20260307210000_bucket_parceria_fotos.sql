-- Bucket para fotos de solicitações de parceria
INSERT INTO storage.buckets (id, name, public)
VALUES ('parceria-fotos', 'parceria-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Upload: apenas autenticados
DROP POLICY IF EXISTS "parceria-fotos: upload autenticado" ON storage.objects;
CREATE POLICY "parceria-fotos: upload autenticado"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'parceria-fotos');

-- Leitura pública
DROP POLICY IF EXISTS "parceria-fotos: leitura publica" ON storage.objects;
CREATE POLICY "parceria-fotos: leitura publica"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'parceria-fotos');

-- Delete: apenas dono (path começa com user_id/)
DROP POLICY IF EXISTS "parceria-fotos: delete dono" ON storage.objects;
CREATE POLICY "parceria-fotos: delete dono"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'parceria-fotos' AND (storage.foldername(name))[1] = auth.uid()::text);

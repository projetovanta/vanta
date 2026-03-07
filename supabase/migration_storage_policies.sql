-- ════════════════════════════════════════════════════════════════════════════
-- migration_storage_policies.sql
-- Políticas RLS para os buckets de Storage do Supabase
--
-- Executar no SQL Editor do Supabase Dashboard (Settings → SQL Editor).
-- Os buckets devem já existir (criados via Storage Dashboard).
--
-- Buckets cobertos:
--   avatars        → foto de perfil ({userId}/avatar.jpg)
--   profile-albums → álbum de fotos ({userId}/album_0.jpg ... album_5.jpg)
--   selfies        → biometria facial ({userId}/biometria.jpg)
--   event-assets   → fotos de eventos
--   indica-assets  → fotos do VANTA Indica
-- ════════════════════════════════════════════════════════════════════════════

-- ── avatars ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "avatars: leitura pública"      ON storage.objects;
DROP POLICY IF EXISTS "avatars: upload próprio"        ON storage.objects;
DROP POLICY IF EXISTS "avatars: delete próprio"        ON storage.objects;

CREATE POLICY "avatars: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: upload próprio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars: update próprio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars: delete próprio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── profile-albums ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profile-albums: leitura pública"  ON storage.objects;
DROP POLICY IF EXISTS "profile-albums: upload próprio"   ON storage.objects;
DROP POLICY IF EXISTS "profile-albums: update próprio"   ON storage.objects;
DROP POLICY IF EXISTS "profile-albums: delete próprio"   ON storage.objects;

CREATE POLICY "profile-albums: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-albums');

CREATE POLICY "profile-albums: upload próprio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-albums'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile-albums: update próprio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-albums'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile-albums: delete próprio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-albums'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── selfies ───────────────────────────────────────────────────────────────────
-- Leitura restrita: apenas o próprio usuário ou masteradm

DROP POLICY IF EXISTS "selfies: leitura própria ou master" ON storage.objects;
DROP POLICY IF EXISTS "selfies: upload próprio"            ON storage.objects;
DROP POLICY IF EXISTS "selfies: update próprio"            ON storage.objects;
DROP POLICY IF EXISTS "selfies: delete próprio"            ON storage.objects;
DROP POLICY IF EXISTS "selfies: upload caixa tickets"      ON storage.objects;

CREATE POLICY "selfies: leitura própria ou master"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_ger_portaria_lista', 'vanta_portaria_lista', 'vanta_ger_portaria_antecipado', 'vanta_portaria_antecipado', 'vanta_caixa')
    )
  );

CREATE POLICY "selfies: upload próprio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'selfies'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_caixa')
    )
  );

CREATE POLICY "selfies: update próprio"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_caixa')
    )
  );

CREATE POLICY "selfies: delete próprio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'selfies'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (auth.jwt() ->> 'role') = 'vanta_masteradm'
    )
  );

-- ── event-assets ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "event-assets: leitura pública"  ON storage.objects;
DROP POLICY IF EXISTS "event-assets: upload gerente"  ON storage.objects;
DROP POLICY IF EXISTS "event-assets: delete gerente"  ON storage.objects;

CREATE POLICY "event-assets: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-assets');

CREATE POLICY "event-assets: upload gerente"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-assets'
    AND (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_gerente', 'vanta_socio')
  );

CREATE POLICY "event-assets: update gerente"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_gerente', 'vanta_socio')
  );

CREATE POLICY "event-assets: delete gerente"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-assets'
    AND (auth.jwt() ->> 'role') IN ('vanta_masteradm', 'vanta_gerente', 'vanta_socio')
  );

-- ── indica-assets ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "indica-assets: leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "indica-assets: upload master"   ON storage.objects;
DROP POLICY IF EXISTS "indica-assets: delete master"   ON storage.objects;

CREATE POLICY "indica-assets: leitura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'indica-assets');

CREATE POLICY "indica-assets: upload master"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'indica-assets'
    AND (auth.jwt() ->> 'role') = 'vanta_masteradm'
  );

CREATE POLICY "indica-assets: update master"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'indica-assets'
    AND (auth.jwt() ->> 'role') = 'vanta_masteradm'
  );

CREATE POLICY "indica-assets: delete master"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'indica-assets'
    AND (auth.jwt() ->> 'role') = 'vanta_masteradm'
  );

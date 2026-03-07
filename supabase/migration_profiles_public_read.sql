-- ══════════════════════════════════════════════════════════
-- Migration: profiles — leitura pública para busca de membros
-- A policy anterior (leitura própria) bloqueava busca por
-- nome/email de outros usuários. Agora qualquer autenticado
-- pode ler perfis (dados públicos: nome, email, foto, etc.).
-- ══════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "profiles: leitura própria" ON profiles;
DROP POLICY IF EXISTS "profiles: leitura pública" ON profiles;

CREATE POLICY "profiles: leitura pública"
  ON profiles FOR SELECT USING (true);

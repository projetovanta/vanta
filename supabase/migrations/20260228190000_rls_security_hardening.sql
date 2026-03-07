-- ══════════════════════════════════════════════════════════════════════════════
-- RLS Security Hardening — Substituir policies permissivas por restritivas
-- Tabelas afetadas: membros_clube, lotes_mais_vanta, reservas_mais_vanta,
--   solicitacoes_clube, assinaturas_mais_vanta, passport_aprovacoes,
--   clube_config, categorias_evento, mesas, waitlist, cupons
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. membros_clube ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "membros_clube_all" ON membros_clube;
CREATE POLICY "membros_clube_write" ON membros_clube
  FOR ALL USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- ── 2. lotes_mais_vanta ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lotes_mais_vanta_all" ON lotes_mais_vanta;
CREATE POLICY "lotes_mais_vanta_write" ON lotes_mais_vanta
  FOR ALL USING (is_masteradm() OR is_produtor_evento(evento_id))
  WITH CHECK (is_masteradm() OR is_produtor_evento(evento_id));

-- ── 3. reservas_mais_vanta ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "reservas_mais_vanta_all" ON reservas_mais_vanta;
CREATE POLICY "reservas_mais_vanta_insert" ON reservas_mais_vanta
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reservas_mais_vanta_update" ON reservas_mais_vanta
  FOR UPDATE USING (auth.uid() = user_id OR is_masteradm());
CREATE POLICY "reservas_mais_vanta_delete" ON reservas_mais_vanta
  FOR DELETE USING (auth.uid() = user_id OR is_masteradm());

-- ── 4. solicitacoes_clube ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "solicitacoes_clube_all" ON solicitacoes_clube;
CREATE POLICY "solicitacoes_clube_insert" ON solicitacoes_clube
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "solicitacoes_clube_manage" ON solicitacoes_clube
  FOR UPDATE USING (is_masteradm());
CREATE POLICY "solicitacoes_clube_delete" ON solicitacoes_clube
  FOR DELETE USING (is_masteradm());

-- ── 5. assinaturas_mais_vanta ───────────────────────────────────────────────
DROP POLICY IF EXISTS "assinaturas_mv_all" ON assinaturas_mais_vanta;
CREATE POLICY "assinaturas_mv_insert" ON assinaturas_mais_vanta
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "assinaturas_mv_update" ON assinaturas_mais_vanta
  FOR UPDATE USING (is_masteradm() OR auth.uid() = criado_por);
CREATE POLICY "assinaturas_mv_delete" ON assinaturas_mais_vanta
  FOR DELETE USING (is_masteradm());

-- ── 6. passport_aprovacoes ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "passport_all" ON passport_aprovacoes;
CREATE POLICY "passport_insert" ON passport_aprovacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "passport_manage" ON passport_aprovacoes
  FOR UPDATE USING (is_masteradm());
CREATE POLICY "passport_delete" ON passport_aprovacoes
  FOR DELETE USING (is_masteradm());

-- ── 7. clube_config ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "clube_config_write" ON clube_config;
CREATE POLICY "clube_config_write" ON clube_config
  FOR ALL USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- ── 8. categorias_evento ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "master_write" ON categorias_evento;
CREATE POLICY "categorias_write" ON categorias_evento
  FOR ALL USING (is_masteradm())
  WITH CHECK (is_masteradm());

-- ── 9-11. Tabelas opcionais (podem não existir) ────────────────────────────
DO $$ BEGIN
  -- mesas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mesas') THEN
    EXECUTE 'DROP POLICY IF EXISTS "mesas_admin" ON mesas';
    EXECUTE 'CREATE POLICY "mesas_write" ON mesas FOR ALL USING (is_masteradm() OR is_produtor_evento(evento_id)) WITH CHECK (is_masteradm() OR is_produtor_evento(evento_id))';
  END IF;

  -- waitlist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'waitlist') THEN
    EXECUTE 'DROP POLICY IF EXISTS "waitlist_select" ON waitlist';
    EXECUTE 'DROP POLICY IF EXISTS "waitlist_insert" ON waitlist';
    EXECUTE 'CREATE POLICY "waitlist_select" ON waitlist FOR SELECT USING (auth.uid() = user_id OR is_masteradm())';
    EXECUTE 'CREATE POLICY "waitlist_insert" ON waitlist FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))';
  END IF;

  -- cupons
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cupons') THEN
    EXECUTE 'DROP POLICY IF EXISTS "cupons_admin" ON cupons';
    EXECUTE 'CREATE POLICY "cupons_write" ON cupons FOR ALL USING (is_masteradm() OR auth.uid() = criado_por) WITH CHECK (is_masteradm() OR auth.uid() = criado_por)';
  END IF;
END $$;

-- ── 12. RPC incrementar_usos_cupom — adicionar guard de limite ──────────────
CREATE OR REPLACE FUNCTION incrementar_usos_cupom(cupom_id UUID)
RETURNS VOID AS $$
  UPDATE cupons
  SET usos = usos + 1
  WHERE id = cupom_id
    AND ativo = true
    AND (limite_usos IS NULL OR usos < limite_usos);
$$ LANGUAGE sql SECURITY DEFINER;

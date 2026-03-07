-- ══════════════════════════════════════════════════════════════════════════════
-- RLS: Habilitar e criar policies para 19 tabelas sem protecao
-- 100% idempotente — DROP IF EXISTS antes de cada CREATE POLICY
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Helper functions (CREATE OR REPLACE = idempotente) ──

CREATE OR REPLACE FUNCTION is_vanta_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vanta_masteradm'
  );
$$;

CREATE OR REPLACE FUNCTION is_vanta_admin_or_gerente()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('vanta_masteradm', 'vanta_gerente')
  );
$$;

CREATE OR REPLACE FUNCTION is_event_team_member(p_evento_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM equipe_evento WHERE evento_id = p_evento_id AND membro_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_event_manager_or_admin(p_evento_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    is_vanta_admin()
    OR EXISTS (
      SELECT 1 FROM eventos_admin WHERE id = p_evento_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM equipe_evento
      WHERE evento_id = p_evento_id
        AND membro_id = auth.uid()
        AND papel IN ('GERENTE', 'SOCIO')
    );
$$;

CREATE OR REPLACE FUNCTION get_evento_from_lista(p_lista_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT evento_id FROM listas_evento WHERE id = p_lista_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_evento_from_lote(p_lote_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT evento_id FROM lotes WHERE id = p_lote_id LIMIT 1;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. tickets_caixa
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE tickets_caixa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_owner" ON tickets_caixa;
CREATE POLICY "tickets_select_owner"
  ON tickets_caixa FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "tickets_select_team" ON tickets_caixa;
CREATE POLICY "tickets_select_team"
  ON tickets_caixa FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id));

DROP POLICY IF EXISTS "tickets_select_admin" ON tickets_caixa;
CREATE POLICY "tickets_select_admin"
  ON tickets_caixa FOR SELECT TO authenticated
  USING (is_vanta_admin());

DROP POLICY IF EXISTS "tickets_update_owner" ON tickets_caixa;
CREATE POLICY "tickets_update_owner"
  ON tickets_caixa FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. profiles
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE TO authenticated
  USING (is_vanta_admin())
  WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "profiles_insert_signup" ON profiles;
CREATE POLICY "profiles_insert_signup"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. eventos_admin
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE eventos_admin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eventos_select_published" ON eventos_admin;
CREATE POLICY "eventos_select_published"
  ON eventos_admin FOR SELECT TO authenticated
  USING (publicado = true);

DROP POLICY IF EXISTS "eventos_select_creator" ON eventos_admin;
CREATE POLICY "eventos_select_creator"
  ON eventos_admin FOR SELECT TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "eventos_select_team" ON eventos_admin;
CREATE POLICY "eventos_select_team"
  ON eventos_admin FOR SELECT TO authenticated
  USING (is_event_team_member(id));

DROP POLICY IF EXISTS "eventos_select_admin" ON eventos_admin;
CREATE POLICY "eventos_select_admin"
  ON eventos_admin FOR SELECT TO authenticated
  USING (is_vanta_admin());

DROP POLICY IF EXISTS "eventos_insert" ON eventos_admin;
CREATE POLICY "eventos_insert"
  ON eventos_admin FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR is_vanta_admin());

DROP POLICY IF EXISTS "eventos_update" ON eventos_admin;
CREATE POLICY "eventos_update"
  ON eventos_admin FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR is_event_team_member(id) OR is_vanta_admin())
  WITH CHECK (created_by = auth.uid() OR is_event_team_member(id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. lotes
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lotes_select_all" ON lotes;
CREATE POLICY "lotes_select_all"
  ON lotes FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "lotes_insert" ON lotes;
CREATE POLICY "lotes_insert"
  ON lotes FOR INSERT TO authenticated
  WITH CHECK (is_event_manager_or_admin(evento_id));

DROP POLICY IF EXISTS "lotes_update" ON lotes;
CREATE POLICY "lotes_update"
  ON lotes FOR UPDATE TO authenticated
  USING (is_event_manager_or_admin(evento_id))
  WITH CHECK (is_event_manager_or_admin(evento_id));

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. variacoes_ingresso
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE variacoes_ingresso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variacoes_select_all" ON variacoes_ingresso;
CREATE POLICY "variacoes_select_all"
  ON variacoes_ingresso FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "variacoes_insert" ON variacoes_ingresso;
CREATE POLICY "variacoes_insert"
  ON variacoes_ingresso FOR INSERT TO authenticated
  WITH CHECK (is_event_manager_or_admin(get_evento_from_lote(lote_id)));

DROP POLICY IF EXISTS "variacoes_update" ON variacoes_ingresso;
CREATE POLICY "variacoes_update"
  ON variacoes_ingresso FOR UPDATE TO authenticated
  USING (is_event_manager_or_admin(get_evento_from_lote(lote_id)))
  WITH CHECK (is_event_manager_or_admin(get_evento_from_lote(lote_id)));

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. vendas_log
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE vendas_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendas_log_select" ON vendas_log;
CREATE POLICY "vendas_log_select"
  ON vendas_log FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. transactions
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select" ON transactions;
CREATE POLICY "transactions_select"
  ON transactions FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. cortesias_config
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE cortesias_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cortesias_config_master" ON cortesias_config;
DROP POLICY IF EXISTS "cortesias_config_read_equipe" ON cortesias_config;

DROP POLICY IF EXISTS "cortesias_config_select" ON cortesias_config;
CREATE POLICY "cortesias_config_select"
  ON cortesias_config FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

DROP POLICY IF EXISTS "cortesias_config_insert" ON cortesias_config;
CREATE POLICY "cortesias_config_insert"
  ON cortesias_config FOR INSERT TO authenticated
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

DROP POLICY IF EXISTS "cortesias_config_update" ON cortesias_config;
CREATE POLICY "cortesias_config_update"
  ON cortesias_config FOR UPDATE TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. cortesias_log
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE cortesias_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cortesias_log_select" ON cortesias_log;
CREATE POLICY "cortesias_log_select"
  ON cortesias_log FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

DROP POLICY IF EXISTS "cortesias_log_insert" ON cortesias_log;
CREATE POLICY "cortesias_log_insert"
  ON cortesias_log FOR INSERT TO authenticated
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. convidados_lista
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE convidados_lista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "convidados_lista_select" ON convidados_lista;
CREATE POLICY "convidados_lista_select"
  ON convidados_lista FOR SELECT TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "convidados_lista_insert" ON convidados_lista;
CREATE POLICY "convidados_lista_insert"
  ON convidados_lista FOR INSERT TO authenticated
  WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "convidados_lista_update" ON convidados_lista;
CREATE POLICY "convidados_lista_update"
  ON convidados_lista FOR UPDATE TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "convidados_lista_delete" ON convidados_lista;
CREATE POLICY "convidados_lista_delete"
  ON convidados_lista FOR DELETE TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 11. regras_lista
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE regras_lista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "regras_lista_select" ON regras_lista;
CREATE POLICY "regras_lista_select"
  ON regras_lista FOR SELECT TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "regras_lista_insert" ON regras_lista;
CREATE POLICY "regras_lista_insert"
  ON regras_lista FOR INSERT TO authenticated
  WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "regras_lista_update" ON regras_lista;
CREATE POLICY "regras_lista_update"
  ON regras_lista FOR UPDATE TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "regras_lista_delete" ON regras_lista;
CREATE POLICY "regras_lista_delete"
  ON regras_lista FOR DELETE TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 12. audit_logs
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT TO authenticated
  USING (is_vanta_admin_or_gerente());

-- ══════════════════════════════════════════════════════════════════════════════
-- 13. solicitacoes_saque
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE solicitacoes_saque ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saques_select" ON solicitacoes_saque;
CREATE POLICY "saques_select"
  ON solicitacoes_saque FOR SELECT TO authenticated
  USING (produtor_id = auth.uid() OR is_vanta_admin());

DROP POLICY IF EXISTS "saques_insert" ON solicitacoes_saque;
CREATE POLICY "saques_insert"
  ON solicitacoes_saque FOR INSERT TO authenticated
  WITH CHECK (produtor_id = auth.uid());

DROP POLICY IF EXISTS "saques_update_admin" ON solicitacoes_saque;
CREATE POLICY "saques_update_admin"
  ON solicitacoes_saque FOR UPDATE TO authenticated
  USING (is_vanta_admin())
  WITH CHECK (is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 14. soberania_acesso
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE soberania_acesso ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "soberania_select" ON soberania_acesso;
CREATE POLICY "soberania_select"
  ON soberania_acesso FOR SELECT TO authenticated
  USING (solicitante_id = auth.uid() OR is_event_manager_or_admin(evento_id));

DROP POLICY IF EXISTS "soberania_insert" ON soberania_acesso;
CREATE POLICY "soberania_insert"
  ON soberania_acesso FOR INSERT TO authenticated
  WITH CHECK (solicitante_id = auth.uid() OR is_event_manager_or_admin(evento_id));

DROP POLICY IF EXISTS "soberania_update" ON soberania_acesso;
CREATE POLICY "soberania_update"
  ON soberania_acesso FOR UPDATE TO authenticated
  USING (is_event_manager_or_admin(evento_id))
  WITH CHECK (is_event_manager_or_admin(evento_id));

-- ══════════════════════════════════════════════════════════════════════════════
-- 15. vanta_indica
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE vanta_indica ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "indica_select" ON vanta_indica;
CREATE POLICY "indica_select"
  ON vanta_indica FOR SELECT TO authenticated
  USING (ativo = true OR is_vanta_admin());

DROP POLICY IF EXISTS "indica_insert" ON vanta_indica;
CREATE POLICY "indica_insert"
  ON vanta_indica FOR INSERT TO authenticated
  WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "indica_update" ON vanta_indica;
CREATE POLICY "indica_update"
  ON vanta_indica FOR UPDATE TO authenticated
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "indica_delete" ON vanta_indica;
CREATE POLICY "indica_delete"
  ON vanta_indica FOR DELETE TO authenticated
  USING (is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 16. interesses
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE interesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "master_full_access" ON interesses;
DROP POLICY IF EXISTS "anyone_can_read_active" ON interesses;

DROP POLICY IF EXISTS "interesses_select" ON interesses;
CREATE POLICY "interesses_select"
  ON interesses FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "interesses_insert" ON interesses;
CREATE POLICY "interesses_insert"
  ON interesses FOR INSERT TO authenticated
  WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "interesses_update" ON interesses;
CREATE POLICY "interesses_update"
  ON interesses FOR UPDATE TO authenticated
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "interesses_delete" ON interesses;
CREATE POLICY "interesses_delete"
  ON interesses FOR DELETE TO authenticated
  USING (is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 17. chargebacks
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE chargebacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chargebacks_master" ON chargebacks;

DROP POLICY IF EXISTS "chargebacks_select" ON chargebacks;
CREATE POLICY "chargebacks_select"
  ON chargebacks FOR SELECT TO authenticated
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- 18. cotas_promoter
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE cotas_promoter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cotas_select_promoter" ON cotas_promoter;
CREATE POLICY "cotas_select_promoter"
  ON cotas_promoter FOR SELECT TO authenticated
  USING (promoter_id = auth.uid());

DROP POLICY IF EXISTS "cotas_select_manager" ON cotas_promoter;
CREATE POLICY "cotas_select_manager"
  ON cotas_promoter FOR SELECT TO authenticated
  USING (is_event_team_member(get_evento_from_lista(lista_id)) OR is_vanta_admin());

DROP POLICY IF EXISTS "cotas_insert" ON cotas_promoter;
CREATE POLICY "cotas_insert"
  ON cotas_promoter FOR INSERT TO authenticated
  WITH CHECK (is_event_manager_or_admin(get_evento_from_lista(lista_id)));

DROP POLICY IF EXISTS "cotas_update" ON cotas_promoter;
CREATE POLICY "cotas_update"
  ON cotas_promoter FOR UPDATE TO authenticated
  USING (is_event_manager_or_admin(get_evento_from_lista(lista_id)))
  WITH CHECK (is_event_manager_or_admin(get_evento_from_lista(lista_id)));

-- ══════════════════════════════════════════════════════════════════════════════
-- queimar_ingresso SECURITY DEFINER
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS func_sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'queimar_ingresso' AND n.nspname = 'public'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER', r.func_sig);
  END LOOP;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- GRANTs
-- ══════════════════════════════════════════════════════════════════════════════
GRANT EXECUTE ON FUNCTION is_vanta_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_vanta_admin_or_gerente() TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_team_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_manager_or_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_evento_from_lista(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_evento_from_lote(UUID) TO authenticated;

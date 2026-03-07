-- ============================================================
-- FIX: Remover TODAS as policies abertas (ALL com auth.uid() IS NOT NULL ou true)
-- Corrige 21 tabelas com brechas de seguranca
-- ============================================================

-- ============================================================
-- 1. COMUNIDADES — DROP policy ALL aberta (ja tem policies proprias)
-- ============================================================
DROP POLICY IF EXISTS "comunidades_all" ON comunidades;

-- ============================================================
-- 2. EVENTOS_ADMIN — DROP policy ALL aberta (ja tem policies proprias)
-- ============================================================
DROP POLICY IF EXISTS "eventos_admin_all" ON eventos_admin;

-- ============================================================
-- 3. LOTES — DROP policy ALL aberta + SELECT duplicado (ja tem policies proprias)
-- ============================================================
DROP POLICY IF EXISTS "lotes_all" ON lotes;
DROP POLICY IF EXISTS "lotes_select_all" ON lotes;

-- ============================================================
-- 4. VARIACOES_INGRESSO — DROP policy ALL aberta + SELECT duplicado
-- ============================================================
DROP POLICY IF EXISTS "variacoes_ingresso_all" ON variacoes_ingresso;
DROP POLICY IF EXISTS "variacoes_select_all" ON variacoes_ingresso;

-- ============================================================
-- 5. LOTES_MAIS_VANTA — DROP policy ALL aberta (ja tem write policy master/produtor)
-- ============================================================
DROP POLICY IF EXISTS "lotes_mais_vanta_all" ON lotes_mais_vanta;

-- ============================================================
-- 6. MEMBROS_CLUBE — DROP policy ALL aberta (ja tem write policy masteradm)
-- ============================================================
DROP POLICY IF EXISTS "membros_clube_all" ON membros_clube;

-- ============================================================
-- 7. RESERVAS_MAIS_VANTA — DROP policy ALL aberta (ja tem policies proprias)
-- ============================================================
DROP POLICY IF EXISTS "reservas_mais_vanta_all" ON reservas_mais_vanta;

-- ============================================================
-- 8. SOLICITACOES_CLUBE — DROP policy ALL aberta (ja tem policies proprias)
-- ============================================================
DROP POLICY IF EXISTS "solicitacoes_clube_all" ON solicitacoes_clube;

-- ============================================================
-- 9. NIVEIS_PRESTIGIO — DROP ALL aberta, manter SELECT publico, add admin ALL
-- ============================================================
DROP POLICY IF EXISTS "niveis_prestigio_all" ON niveis_prestigio;

CREATE POLICY "niveis_prestigio_admin_all"
  ON niveis_prestigio FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

-- ============================================================
-- 10. NOTIFICACOES_POSEVENTO — DROP ALL aberta, restringir write a team/admin
-- ============================================================
DROP POLICY IF EXISTS "notificacoes_posevento_all" ON notificacoes_posevento;

CREATE POLICY "notificacoes_posevento_insert_team"
  ON notificacoes_posevento FOR INSERT
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

CREATE POLICY "notificacoes_posevento_update_team"
  ON notificacoes_posevento FOR UPDATE
  USING (is_event_team_member(evento_id) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

CREATE POLICY "notificacoes_posevento_delete_admin"
  ON notificacoes_posevento FOR DELETE
  USING (is_vanta_admin());

-- ============================================================
-- 11. MESAS — DROP todas abertas, restringir a team/admin, SELECT publico
-- ============================================================
DROP POLICY IF EXISTS "mesas: leitura autenticado" ON mesas;
DROP POLICY IF EXISTS "mesas: inserção autenticado" ON mesas;
DROP POLICY IF EXISTS "mesas: atualização autenticado" ON mesas;
DROP POLICY IF EXISTS "mesas: exclusão autenticado" ON mesas;

CREATE POLICY "mesas_select"
  ON mesas FOR SELECT
  USING (true);

CREATE POLICY "mesas_insert_team"
  ON mesas FOR INSERT
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

CREATE POLICY "mesas_update_team"
  ON mesas FOR UPDATE
  USING (is_event_team_member(evento_id) OR is_vanta_admin())
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

CREATE POLICY "mesas_delete_team"
  ON mesas FOR DELETE
  USING (is_event_team_member(evento_id) OR is_vanta_admin());

-- ============================================================
-- 12. ATRIBUICOES_RBAC — DROP INSERT/UPDATE abertas (ja tem atrib_write_master ALL)
-- ============================================================
DROP POLICY IF EXISTS "atribuicoes_rbac: inserção autenticado" ON atribuicoes_rbac;
DROP POLICY IF EXISTS "atribuicoes_rbac: atualização autenticado" ON atribuicoes_rbac;
DROP POLICY IF EXISTS "atribuicoes_rbac: leitura autenticado" ON atribuicoes_rbac;
-- Manter: atrib_select_authenticated (SELECT true) e atrib_write_master (ALL masteradm)

-- ============================================================
-- 13. CHARGEBACKS — DROP INSERT aberta, restringir a team/admin
-- ============================================================
DROP POLICY IF EXISTS "chargebacks_insert_auth" ON chargebacks;

CREATE POLICY "chargebacks_insert_team"
  ON chargebacks FOR INSERT
  WITH CHECK (is_event_team_member(evento_id) OR is_vanta_admin());

-- admin ALL (se nao existir)
CREATE POLICY "chargebacks_admin_all"
  ON chargebacks FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

-- ============================================================
-- 14. NOTIFICATIONS — DROP INSERT aberta, restringir a admin only
-- (Edge Functions usam service_role, RPCs sao SECURITY DEFINER)
-- ============================================================
DROP POLICY IF EXISTS "notif_ins_open" ON notifications;

CREATE POLICY "notif_insert_admin"
  ON notifications FOR INSERT
  WITH CHECK (is_vanta_admin());

-- ============================================================
-- 15. PAGAMENTOS_PROMOTER — DROP INSERT aberta (ja tem admin_all)
-- ============================================================
DROP POLICY IF EXISTS "pagamentos_promoter_insert" ON pagamentos_promoter;

-- ============================================================
-- 16. VANTA_INDICA — DROP INSERT aberta + SELECTs duplicados
-- (ja tem indica_insert com is_vanta_admin)
-- ============================================================
DROP POLICY IF EXISTS "vanta_indica_insert" ON vanta_indica;
DROP POLICY IF EXISTS "vanta_indica: leitura autenticado" ON vanta_indica;
DROP POLICY IF EXISTS "vanta_indica: leitura publica" ON vanta_indica;
-- Manter: indica_insert (admin), indica_select (ativo OR admin), indica_update (admin),
--         indica_delete (admin), vanta_indica_delete_own, vanta_indica_update_own

-- ============================================================
-- 17. ASSINATURAS_MAIS_VANTA — Restringir INSERT ao proprio usuario
-- ============================================================
DROP POLICY IF EXISTS "assinaturas_mv_insert" ON assinaturas_mais_vanta;

CREATE POLICY "assinaturas_mv_insert_own"
  ON assinaturas_mais_vanta FOR INSERT
  WITH CHECK (auth.uid() = criado_por);

-- Admin ALL (se nao existir)
CREATE POLICY "assinaturas_mv_admin_all"
  ON assinaturas_mais_vanta FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

-- ============================================================
-- 18. REEMBOLSOS — Restringir INSERT ao solicitante, UPDATE so admin
-- ============================================================
DROP POLICY IF EXISTS "reembolsos_insert" ON reembolsos;
DROP POLICY IF EXISTS "reembolsos_update" ON reembolsos;

CREATE POLICY "reembolsos_insert_owner"
  ON reembolsos FOR INSERT
  WITH CHECK (auth.uid() = solicitado_por);

CREATE POLICY "reembolsos_update_admin"
  ON reembolsos FOR UPDATE
  USING (is_vanta_admin())
  WITH CHECK (is_vanta_admin());

-- Restringir SELECT: usuario ve seus proprios + team do evento + admin
CREATE POLICY "reembolsos_select_own"
  ON reembolsos FOR SELECT
  USING (auth.uid() = solicitado_por OR is_event_team_member(evento_id) OR is_vanta_admin());

DROP POLICY IF EXISTS "reembolsos_select" ON reembolsos;

-- Admin ALL
CREATE POLICY "reembolsos_admin_all"
  ON reembolsos FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

-- ============================================================
-- 19-21. LOOKUP TABLES (estilos, experiencias, formatos)
-- DROP master_write (ALL true), manter public_read, add admin ALL
-- ============================================================
DROP POLICY IF EXISTS "master_write" ON estilos;
CREATE POLICY "estilos_admin_all"
  ON estilos FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "master_write" ON experiencias;
CREATE POLICY "experiencias_admin_all"
  ON experiencias FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

DROP POLICY IF EXISTS "master_write" ON formatos;
CREATE POLICY "formatos_admin_all"
  ON formatos FOR ALL
  USING (is_vanta_admin()) WITH CHECK (is_vanta_admin());

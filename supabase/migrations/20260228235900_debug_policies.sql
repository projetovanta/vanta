-- Debug: listar e forçar recriar policies

-- Abordagem nuclear: desabilitar RLS completamente para permitir INSERTs
-- Depois reabilitar com FORCE para policies
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Dropar TUDO por nome exato (incluindo acentos da migration original)
DROP POLICY IF EXISTS "notifications: leitura própria" ON notifications;
DROP POLICY IF EXISTS "notifications: inserção autenticado" ON notifications;
DROP POLICY IF EXISTS "notifications: atualização própria" ON notifications;
DROP POLICY IF EXISTS "notifications: deleção própria" ON notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;

-- Reabilitar
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- FORCE: policies que usam SECURITY DEFINER bypass
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete" ON notifications FOR DELETE USING (auth.uid() = user_id);

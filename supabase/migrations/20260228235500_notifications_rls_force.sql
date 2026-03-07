-- Force reset RLS notifications — abordagem direta sem DO block

-- Dropar todas as policies conhecidas (nomes possíveis)
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "notifications: inserção autenticado" ON notifications;
DROP POLICY IF EXISTS "notifications: leitura própria" ON notifications;
DROP POLICY IF EXISTS "notifications: leitura propria" ON notifications;
DROP POLICY IF EXISTS "notifications: update próprio" ON notifications;
DROP POLICY IF EXISTS "notifications: update proprio" ON notifications;
DROP POLICY IF EXISTS "notifications: delete próprio" ON notifications;
DROP POLICY IF EXISTS "notifications: delete proprio" ON notifications;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON notifications;
DROP POLICY IF EXISTS "Allow select for own" ON notifications;
DROP POLICY IF EXISTS "Allow update for own" ON notifications;
DROP POLICY IF EXISTS "Allow delete for own" ON notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON notifications;
DROP POLICY IF EXISTS "Enable read access for own rows" ON notifications;
DROP POLICY IF EXISTS "Enable update for own rows" ON notifications;
DROP POLICY IF EXISTS "Enable delete for own rows" ON notifications;

-- Desabilitar e reabilitar RLS para limpar estado
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Recriar policies limpas
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Reset completo das policies da tabela notifications
-- Problema: INSERT falhava com 403 para masteradm inserindo para outro user_id

-- Dropar TODAS as policies existentes
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'notifications'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON notifications', pol.policyname);
  END LOOP;
END $$;

-- Garantir RLS ativo
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: usuário lê apenas suas próprias notificações
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: qualquer usuário autenticado pode inserir (para campanhas admin)
CREATE POLICY "notifications_insert_authenticated"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy UPDATE: usuário atualiza apenas suas próprias (marcar lida)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: usuário deleta apenas suas próprias
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

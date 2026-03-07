-- Fix: permitir masteradm inserir notificações para qualquer usuário
-- A policy anterior (auth.uid() IS NOT NULL) pode ter sido sobrescrita

-- Recriar policy de INSERT mais permissiva para campanhas admin
DROP POLICY IF EXISTS "notifications: inserção autenticado" ON notifications;
CREATE POLICY "notifications: inserção autenticado"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

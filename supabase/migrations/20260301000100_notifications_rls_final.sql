-- Reabilitar RLS com policies corretas para role 'authenticated'
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário lê suas próprias notificações
CREATE POLICY "notif_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: qualquer autenticado pode inserir (campanhas admin inserem para outros users)
CREATE POLICY "notif_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: usuário atualiza suas próprias (marcar lida)
CREATE POLICY "notif_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- DELETE: usuário deleta suas próprias
CREATE POLICY "notif_delete" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

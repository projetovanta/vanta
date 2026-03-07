-- Drop all policies and try permissive approach
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_catalog.pg_policies WHERE schemaname = 'public' AND tablename = 'notifications')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.notifications', r.policyname);
    RAISE NOTICE 'Dropped: %', r.policyname;
  END LOOP;
END $$;

-- Disable force RLS (in case it was set)
ALTER TABLE public.notifications NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies sem especificar role (aplica a todos incluindo anon e authenticated)
CREATE POLICY "notif_select_v2" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: totalmente aberto para qualquer role autenticado
CREATE POLICY "notif_insert_v2" ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notif_update_v2" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notif_delete_v2" ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Também criar para service_role (garantia)
CREATE POLICY "notif_service_all" ON public.notifications
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

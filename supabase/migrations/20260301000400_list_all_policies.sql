-- Listar TODAS as policies na tabela notifications e dropar cada uma
DO $$
DECLARE
  r RECORD;
  count_before INT := 0;
BEGIN
  FOR r IN (
    SELECT policyname, permissive, cmd, roles, qual, with_check
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications'
  )
  LOOP
    count_before := count_before + 1;
    RAISE NOTICE 'Policy [%]: permissive=%, cmd=%, roles=%, qual=%, with_check=%',
      r.policyname, r.permissive, r.cmd, r.roles, r.qual, r.with_check;
    EXECUTE format('DROP POLICY %I ON public.notifications', r.policyname);
  END LOOP;

  RAISE NOTICE 'Total policies found and dropped: %', count_before;

  -- Verificar se RLS está habilitado
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'notifications' AND c.relrowsecurity = true
  ) THEN
    RAISE NOTICE 'RLS is ENABLED on notifications';
  ELSE
    RAISE NOTICE 'RLS is DISABLED on notifications';
  END IF;

  -- Verificar FORCE RLS
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'notifications' AND c.relforcerowsecurity = true
  ) THEN
    RAISE NOTICE 'FORCE RLS is ON';
  ELSE
    RAISE NOTICE 'FORCE RLS is OFF';
  END IF;
END $$;

-- Desabilitar completamente e reabilitar
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Criar policy INSERT explicitamente PERMISSIVE (default, mas vamos ser explícitos)
CREATE POLICY "notif_ins_open" ON public.notifications
  AS PERMISSIVE
  FOR INSERT
  WITH CHECK (true);

-- Criar policy SELECT restritiva
CREATE POLICY "notif_sel_own" ON public.notifications
  AS PERMISSIVE
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_upd_own" ON public.notifications
  AS PERMISSIVE
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notif_del_own" ON public.notifications
  AS PERMISSIVE
  FOR DELETE
  USING (auth.uid() = user_id);

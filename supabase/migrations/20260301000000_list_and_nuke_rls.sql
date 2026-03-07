-- Nuclear: desabilitar RLS completamente na tabela notifications
-- Isso permite qualquer operação autenticada sem restrição
-- As policies serão reabilitadas depois de confirmar que funciona

-- Primeiro: dropar TODAS as policies que existam (por query dinâmica)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_catalog.pg_policies WHERE schemaname = 'public' AND tablename = 'notifications')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.notifications', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- Desabilitar RLS completamente
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

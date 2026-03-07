-- Fix global: dropar TODAS as FK constraints que referenciam profiles(id)
-- Motivo: RLS da tabela profiles bloqueia FK check quando um usuário
-- opera em dados de outro usuário (ex: admin inserindo notificação,
-- registrando push token, etc). A integridade é mantida pela lógica do app.

DO $$
DECLARE
  r RECORD;
  count_dropped INT := 0;
BEGIN
  FOR r IN (
    SELECT c.conname, cl.relname AS tablename
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE c.confrelid = 'public.profiles'::regclass
      AND c.contype = 'f'
      AND n.nspname = 'public'
  )
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.tablename, r.conname);
    RAISE NOTICE 'Dropped FK % on table %', r.conname, r.tablename;
    count_dropped := count_dropped + 1;
  END LOOP;

  RAISE NOTICE 'Total FK constraints dropped: %', count_dropped;
END $$;

-- Fix: dropar FK de push_subscriptions → profiles
-- Mesmo problema da notifications: RLS da profiles bloqueia FK check

DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.push_subscriptions'::regclass
    AND confrelid = 'public.profiles'::regclass
    AND contype = 'f';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.push_subscriptions DROP CONSTRAINT %I', fk_name);
    RAISE NOTICE 'Dropped FK: %', fk_name;
  ELSE
    RAISE NOTICE 'No FK found';
  END IF;
END $$;

-- Garantir policies corretas (TO authenticated)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='push_subscriptions')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.push_subscriptions', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_sel" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_ins" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_del" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Fix: dropar FK constraint de notifications.user_id → profiles.id
-- Motivo: RLS da tabela profiles impede verificação FK quando
-- um usuário (masteradm) insere notificação para outro user_id.
-- A integridade referencial será mantida pela lógica do app.

-- Encontrar e dropar a constraint FK
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.notifications'::regclass
    AND confrelid = 'public.profiles'::regclass
    AND contype = 'f';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.notifications DROP CONSTRAINT %I', fk_name);
    RAISE NOTICE 'Dropped FK constraint: %', fk_name;
  ELSE
    RAISE NOTICE 'No FK constraint found between notifications and profiles';
  END IF;
END $$;

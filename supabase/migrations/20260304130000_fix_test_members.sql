-- FIX: Remove test members criados via INSERT direto (schema incompatível com GoTrue)
-- Serão recriados via Admin API após esta migration
DO $$
DECLARE
  v_emails TEXT[] := ARRAY[
    'ana.carla.freitas@vanta.com',
    'lizandra.antunes@vanta.com',
    'dani.fagundes@vanta.com',
    'dan.loures@vanta.com',
    'rodrigo.pegado@vanta.com',
    'renata.andrade@vanta.com',
    'jojo.todinho@vanta.com',
    'dudu.brasil@vanta.com'
  ];
  v_email TEXT;
  v_uid UUID;
BEGIN
  FOREACH v_email IN ARRAY v_emails LOOP
    SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
    IF v_uid IS NOT NULL THEN
      DELETE FROM auth.identities WHERE user_id = v_uid;
      DELETE FROM public.profiles WHERE id = v_uid;
      DELETE FROM auth.users WHERE id = v_uid;
      RAISE NOTICE 'Removido: %', v_email;
    END IF;
  END LOOP;
END $$;

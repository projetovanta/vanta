-- Seed: 8 membros de teste (@vanta.com) — senha: vanta123
DO $$
DECLARE
  v_users TEXT[][] := ARRAY[
    ARRAY['ana.carla.freitas', 'Ana Carla Freitas'],
    ARRAY['lizandra.antunes', 'Lizandra Antunes'],
    ARRAY['dani.fagundes', 'Dani Fagundes'],
    ARRAY['dan.loures', 'Dan Loures'],
    ARRAY['rodrigo.pegado', 'Rodrigo Pegado'],
    ARRAY['renata.andrade', 'Renata Andrade'],
    ARRAY['jojo.todinho', 'Jojo Todinho'],
    ARRAY['dudu.brasil', 'Dudu Brasil']
  ];
  v_email TEXT;
  v_nome TEXT;
  v_uid UUID;
BEGIN
  FOR i IN 1..array_length(v_users, 1) LOOP
    v_email := v_users[i][1] || '@vanta.com';
    v_nome := v_users[i][2];
    v_uid := gen_random_uuid();

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
      RAISE NOTICE 'Ja existe: %', v_email;
      CONTINUE;
    END IF;

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
    ) VALUES (
      v_uid,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt('vanta123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nome', v_nome),
      'authenticated',
      'authenticated',
      now(),
      now()
    );

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_uid, v_uid, v_email,
      jsonb_build_object('sub', v_uid::text, 'email', v_email),
      'email', now(), now(), now()
    );

    INSERT INTO public.profiles (id, email, nome, full_name, role)
    VALUES (v_uid, v_email, split_part(v_nome, ' ', 1), v_nome, 'vanta_member')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Criado: % (%)', v_nome, v_email;
  END LOOP;
END $$;

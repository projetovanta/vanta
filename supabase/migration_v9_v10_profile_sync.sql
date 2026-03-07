-- Migration v9→v10: Sincronizar perfil completo (álbum + privacidade)
-- Executar no Supabase Dashboard → SQL Editor

-- Álbum de fotos (URLs do Storage, máx 6)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS album_urls TEXT[] NOT NULL DEFAULT '{}';

-- Configuração de privacidade (JSONB)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS privacidade JSONB NOT NULL DEFAULT '{
    "adicionarAmigo": "TODOS",
    "verEmail": "NINGUEM",
    "verBio": "TODOS",
    "verInstagram": "AMIGOS",
    "verInteresses": "AMIGOS",
    "verEventos": "TODOS",
    "verAlbum": "AMIGOS",
    "verAniversario": "AMIGOS"
  }'::jsonb;

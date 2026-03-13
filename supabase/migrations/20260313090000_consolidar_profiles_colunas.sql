-- ══════════════════════════════════════════════════════════════════════════════
-- Consolidar colunas duplicadas/órfãs da tabela profiles
--
-- PADRONIZAR (copiar dados legados → coluna padrão):
--   full_name → nome  |  nascimento/birth_date → data_nascimento
--   state → estado     |  city → cidade
--   foto/foto_perfil → avatar_url
--
-- DROPAR (órfãs sem uso em código, triggers, RPCs ou policies):
--   telefone (campo único), status, prestigio_id
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Consolidar full_name → nome ────────────────────────────────────────
-- Quem tem full_name preenchido e nome vazio/null: copiar
UPDATE profiles
SET nome = full_name
WHERE (nome IS NULL OR nome = '')
  AND full_name IS NOT NULL AND full_name != '';

-- ── 2. Consolidar nascimento/birth_date → data_nascimento ─────────────────
UPDATE profiles
SET data_nascimento = COALESCE(nascimento, birth_date)
WHERE (data_nascimento IS NULL OR data_nascimento = '')
  AND (nascimento IS NOT NULL OR birth_date IS NOT NULL);

-- ── 3. Consolidar state → estado ──────────────────────────────────────────
UPDATE profiles
SET estado = state
WHERE (estado IS NULL OR estado = '')
  AND state IS NOT NULL AND state != '';

-- ── 4. Consolidar city → cidade ───────────────────────────────────────────
UPDATE profiles
SET cidade = city
WHERE (cidade IS NULL OR cidade = '')
  AND city IS NOT NULL AND city != '';

-- ── 5. Consolidar foto/foto_perfil → avatar_url ──────────────────────────
UPDATE profiles
SET avatar_url = COALESCE(foto_perfil, foto)
WHERE (avatar_url IS NULL OR avatar_url = '')
  AND (foto_perfil IS NOT NULL OR foto IS NOT NULL);

-- ── 6. Dropar colunas órfãs ──────────────────────────────────────────────
ALTER TABLE profiles DROP COLUMN IF EXISTS telefone;
ALTER TABLE profiles DROP COLUMN IF EXISTS status;
ALTER TABLE profiles DROP COLUMN IF EXISTS prestigio_id;

-- ── 7. Atualizar RPC anonimizar_conta para usar avatar_url em vez de foto ──
CREATE OR REPLACE FUNCTION anonimizar_conta()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_anon_nome TEXT;
  v_agora TIMESTAMPTZ := now();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  v_anon_nome := 'Usuário Removido #' || substr(v_user_id::text, 1, 8);

  -- 1. Anonimizar perfil
  UPDATE profiles SET
    nome = v_anon_nome,
    avatar_url = NULL,
    biografia = NULL,
    interesses = '{}',
    telefone_ddd = NULL,
    telefone_numero = NULL,
    instagram = NULL,
    cidade = 'Removido',
    estado = NULL,
    genero = 'PREFIRO_NAO_DIZER',
    data_nascimento = '1900-01-01',
    excluido = true,
    excluido_em = v_agora
  WHERE id = v_user_id;

  -- 2. Remover amizades
  DELETE FROM friendships
  WHERE requester_id = v_user_id OR addressee_id = v_user_id;

  -- 3. Remover bloqueios
  DELETE FROM bloqueios
  WHERE bloqueador_id = v_user_id OR bloqueado_id = v_user_id;

  -- 4. Anonimizar mensagens (manter estrutura, limpar conteúdo)
  UPDATE messages SET
    content = '[mensagem removida]'
  WHERE sender_id = v_user_id;

  -- 5. Remover saved_events
  DELETE FROM saved_events WHERE user_id = v_user_id;

  -- 6. Remover follows de comunidades
  DELETE FROM community_follows WHERE user_id = v_user_id;

  -- 7. Remover denúncias feitas pelo usuário
  DELETE FROM denuncias WHERE reporter_id = v_user_id;

  -- NÃO deletar: tickets_caixa, transactions, solicitacoes_saque, reembolsos
  -- (registros fiscais obrigatórios por lei)
END;
$$;

COMMIT;

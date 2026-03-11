-- RPC: anonimizar conta do usuário (exclusão Apple-compliant)
-- Anonimiza dados pessoais, mantém registros fiscais/financeiros intactos
-- SECURITY DEFINER para poder atualizar o próprio perfil mesmo com RLS

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
    foto = NULL,
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

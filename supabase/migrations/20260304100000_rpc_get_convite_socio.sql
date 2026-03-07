-- RPC para buscar dados de convite de sócio sem depender de RLS.
-- Retorna dados do evento + nome do criador + nome da comunidade.
-- Valida que o caller é o socio_convidado_id do evento.

CREATE OR REPLACE FUNCTION get_convite_socio(p_evento_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
  v_caller UUID := auth.uid();
BEGIN
  -- Valida que o caller é o sócio convidado
  IF NOT EXISTS (
    SELECT 1 FROM eventos_admin
    WHERE id = p_evento_id AND socio_convidado_id = v_caller
  ) THEN
    RETURN json_build_object('error', 'not_authorized');
  END IF;

  SELECT json_build_object(
    'id', e.id,
    'nome', e.nome,
    'foto', e.foto,
    'descricao', e.descricao,
    'data_inicio', e.data_inicio,
    'local', e.local,
    'cidade', e.cidade,
    'comunidade_id', e.comunidade_id,
    'comunidade_nome', COALESCE(c.nome, ''),
    'criador_nome', COALESCE(p.full_name, p.nome, 'Produtor'),
    'split_socio', COALESCE(e.split_socio, 70),
    'split_produtor', COALESCE(e.split_produtor, 30),
    'permissoes_produtor', COALESCE(e.permissoes_produtor, '{}'),
    'rodada_negociacao', COALESCE(e.rodada_negociacao, 1),
    'mensagem_negociacao', e.mensagem_negociacao,
    'status_evento', e.status_evento,
    'socio_convidado_id', e.socio_convidado_id
  )
  INTO v_result
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  LEFT JOIN profiles p ON p.id = e.created_by
  WHERE e.id = p_evento_id;

  RETURN COALESCE(v_result, json_build_object('error', 'not_found'));
END;
$$;

-- Acesso: qualquer autenticado pode chamar (a função valida internamente)
GRANT EXECUTE ON FUNCTION get_convite_socio(UUID) TO authenticated;

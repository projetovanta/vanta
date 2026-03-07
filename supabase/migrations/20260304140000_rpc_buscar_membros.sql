-- ══════════════════════════════════════════════════════════════════════════════
-- RPC: buscar_membros — Busca membros por nome ou email
-- ══════════════════════════════════════════════════════════════════════════════
--
-- Problema: RLS da tabela profiles restringe leitura ao próprio usuário.
-- Qualquer busca por outros membros (equipe, convite, transferência) falha.
--
-- Solução: RPC SECURITY DEFINER bypassa RLS e retorna resultados filtrados.
-- Requer autenticação (auth.uid() IS NOT NULL).
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION buscar_membros(
  search_query text,
  max_results int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  nome text,
  full_name text,
  email text,
  foto text,
  instagram text,
  role text,
  cidade text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sanitized text;
BEGIN
  -- Requer autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  -- Sanitizar input
  sanitized := regexp_replace(search_query, '[%_(),.\"''\\]', '', 'g');
  sanitized := trim(sanitized);

  -- Query vazia: retorna todos (até max_results), ordenado por nome
  IF length(sanitized) < 2 THEN
    RETURN QUERY
      SELECT
        p.id,
        p.nome,
        p.full_name,
        p.email,
        p.avatar_url AS foto,
        p.instagram,
        p.role,
        p.cidade
      FROM profiles p
      ORDER BY COALESCE(p.full_name, p.nome) ASC
      LIMIT max_results;
    RETURN;
  END IF;

  RETURN QUERY
    SELECT
      p.id,
      p.nome,
      p.full_name,
      p.email,
      p.avatar_url AS foto,
      p.instagram,
      p.role,
      p.cidade
    FROM profiles p
    WHERE
      p.nome ILIKE '%' || sanitized || '%'
      OR p.full_name ILIKE '%' || sanitized || '%'
      OR p.email ILIKE '%' || sanitized || '%'
    ORDER BY
      CASE
        WHEN p.nome ILIKE sanitized || '%' THEN 0
        WHEN p.full_name ILIKE sanitized || '%' THEN 1
        WHEN p.email ILIKE sanitized || '%' THEN 2
        ELSE 3
      END,
      p.nome ASC
    LIMIT max_results;
END;
$$;

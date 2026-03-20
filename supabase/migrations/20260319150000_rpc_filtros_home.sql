-- ============================================================
-- RPCs para filtros de chips na Home + índice MV config
-- ============================================================

-- 1. Estilos disponíveis por cidade (chips dinâmicos)
CREATE OR REPLACE FUNCTION estilos_por_cidade(p_cidade TEXT)
RETURNS TABLE(estilo TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT unnest(e.estilos) AS estilo
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.publicado = true
    AND (e.data_fim IS NULL OR e.data_fim >= now())
    AND COALESCE(e.cidade, c.cidade, '') = p_cidade
    AND e.estilos IS NOT NULL
    AND array_length(e.estilos, 1) > 0
  ORDER BY estilo;
$$;

-- 2. Eventos com benefício MV ativos pro tier do membro na cidade
CREATE OR REPLACE FUNCTION eventos_com_beneficio_mv(
  p_cidade TEXT,
  p_tier TEXT,
  p_creator_sublevel TEXT DEFAULT NULL,
  p_limit INT DEFAULT 9,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(evento_id UUID, tipo_beneficio TEXT, desconto_percentual INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT ON (e.id)
    e.id AS evento_id,
    mv.tipo AS tipo_beneficio,
    mv.desconto_percentual
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  JOIN mais_vanta_config_evento mv ON mv.evento_id = e.id
  WHERE e.publicado = true
    AND (e.data_fim IS NULL OR e.data_fim >= now())
    AND COALESCE(e.cidade, c.cidade, '') = p_cidade
    AND mv.ativo = true
    AND mv.tier_minimo = p_tier
    AND (mv.vagas_limite IS NULL OR mv.vagas_resgatadas < mv.vagas_limite)
    AND (
      p_tier != 'creator'
      OR mv.creator_sublevel_minimo IS NULL
      OR mv.creator_sublevel_minimo <= COALESCE(p_creator_sublevel, '')
    )
  ORDER BY e.id
  LIMIT p_limit OFFSET p_offset;
$$;

-- 3. Índice para acelerar buscas de benefícios MV ativos
CREATE INDEX IF NOT EXISTS idx_mv_config_evento_tier
  ON mais_vanta_config_evento(evento_id, tier_minimo)
  WHERE ativo = true;

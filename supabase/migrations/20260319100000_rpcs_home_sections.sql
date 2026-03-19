-- Migration: RPCs para novas seções da Home
-- top_vendidos_24h, cidades_com_eventos, parceiros_por_cidade, eventos_por_cidade_paginado
-- + índices para performance

-- ══════════════════════════════════════════════════════════════════════════════
-- Índices
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_vendas_log_ts ON vendas_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_admin_cidade_btree ON eventos_admin(cidade);
CREATE INDEX IF NOT EXISTS idx_comunidades_cidade_ativa ON comunidades(cidade, ativa) WHERE ativa = true;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. top_vendidos_24h — ranking de eventos mais vendidos nas últimas 24h
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION top_vendidos_24h(
  p_cidade TEXT DEFAULT NULL,
  p_limit  INT  DEFAULT 10
)
RETURNS TABLE(evento_id UUID, total_vendas BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT v.evento_id, COUNT(*) AS total_vendas
  FROM vendas_log v
  JOIN eventos_admin e ON e.id = v.evento_id
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE v.ts >= now() - interval '24 hours'
    AND e.publicado = true
    AND (e.data_fim IS NULL OR e.data_fim >= now())
    AND (p_cidade IS NULL OR COALESCE(e.cidade, c.cidade, '') = p_cidade)
  GROUP BY v.evento_id
  ORDER BY total_vendas DESC
  LIMIT p_limit;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. cidades_com_eventos — cidades que têm eventos futuros publicados
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION cidades_com_eventos(p_excluir TEXT DEFAULT NULL)
RETURNS TABLE(cidade TEXT, total_eventos BIGINT, foto_destaque TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COALESCE(e.cidade, c.cidade) AS cidade,
    COUNT(*) AS total_eventos,
    (array_agg(e.foto ORDER BY e.data_inicio ASC) FILTER (WHERE e.foto IS NOT NULL))[1] AS foto_destaque
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.publicado = true
    AND (e.data_fim IS NULL OR e.data_fim >= now())
    AND COALESCE(e.cidade, c.cidade, '') != ''
    AND (p_excluir IS NULL OR COALESCE(e.cidade, c.cidade) != p_excluir)
  GROUP BY COALESCE(e.cidade, c.cidade)
  ORDER BY total_eventos DESC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. parceiros_por_cidade — comunidades ativas filtradas por cidade
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION parceiros_por_cidade(
  p_cidade TEXT,
  p_limit  INT DEFAULT 9,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(id UUID, nome TEXT, foto TEXT, tipo_comunidade TEXT, endereco TEXT, cidade TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.nome, c.foto, c.tipo_comunidade, c.endereco, c.cidade
  FROM comunidades c
  WHERE c.ativa = true
    AND c.cidade = p_cidade
  ORDER BY c.nome
  LIMIT p_limit OFFSET p_offset;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. eventos_por_cidade_paginado — eventos filtrados por cidade, paginados
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION eventos_por_cidade_paginado(
  p_cidade TEXT,
  p_futuros BOOLEAN DEFAULT true,
  p_limit  INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(evento_id UUID)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT e.id AS evento_id
  FROM eventos_admin e
  LEFT JOIN comunidades c ON c.id = e.comunidade_id
  WHERE e.publicado = true
    AND COALESCE(e.cidade, c.cidade, '') = p_cidade
    AND (
      CASE WHEN p_futuros THEN (e.data_fim IS NULL OR e.data_fim >= now())
           ELSE e.data_fim < now()
      END
    )
  ORDER BY
    CASE WHEN p_futuros THEN e.data_inicio END ASC,
    CASE WHEN NOT p_futuros THEN e.data_inicio END DESC
  LIMIT p_limit OFFSET p_offset;
$$;

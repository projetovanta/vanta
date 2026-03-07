-- RPC para buscar eventos por região (bounding box + distância Haversine)
-- coords é JSONB com {lat, lng} na tabela eventos_admin
CREATE OR REPLACE FUNCTION get_eventos_por_regiao(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_raio_km DOUBLE PRECISION DEFAULT 50
)
RETURNS SETOF eventos_admin
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH bbox AS (
    SELECT
      p_lat - (p_raio_km / 111.0) AS min_lat,
      p_lat + (p_raio_km / 111.0) AS max_lat,
      p_lng - (p_raio_km / (111.0 * cos(radians(p_lat)))) AS min_lng,
      p_lng + (p_raio_km / (111.0 * cos(radians(p_lat)))) AS max_lng
  )
  SELECT e.*
  FROM eventos_admin e, bbox b
  WHERE e.coords IS NOT NULL
    AND e.publicado = true
    AND (e.coords->>'lat')::DOUBLE PRECISION BETWEEN b.min_lat AND b.max_lat
    AND (e.coords->>'lng')::DOUBLE PRECISION BETWEEN b.min_lng AND b.max_lng
    AND (
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(p_lat)) * cos(radians((e.coords->>'lat')::DOUBLE PRECISION))
          * cos(radians((e.coords->>'lng')::DOUBLE PRECISION) - radians(p_lng))
          + sin(radians(p_lat)) * sin(radians((e.coords->>'lat')::DOUBLE PRECISION))
        ))
      )
    ) <= p_raio_km
  ORDER BY e.data_inicio DESC;
$$;

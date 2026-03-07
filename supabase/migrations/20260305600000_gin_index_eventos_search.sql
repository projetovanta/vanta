-- Índice GIN para busca server-side de eventos por nome/local/cidade
-- Usa pg_trgm (extensão já habilitada no projeto) para buscas parciais (.ilike)
CREATE INDEX IF NOT EXISTS idx_eventos_admin_nome_trgm
  ON eventos_admin USING gin (nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_eventos_admin_local_trgm
  ON eventos_admin USING gin (local gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_eventos_admin_cidade_trgm
  ON eventos_admin USING gin (cidade gin_trgm_ops);

-- Índice composto para queries de listagem paginada (publicado + data_inicio)
CREATE INDEX IF NOT EXISTS idx_eventos_admin_publicado_data
  ON eventos_admin (publicado, data_inicio)
  WHERE publicado = true;

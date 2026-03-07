-- Adiciona hierarquia pai/filho às categorias de evento
ALTER TABLE categorias_evento ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categorias_evento(id) ON DELETE SET NULL;

-- Índice para busca rápida de subcategorias
CREATE INDEX IF NOT EXISTS idx_categorias_parent ON categorias_evento(parent_id);

-- Adiciona subcategorias ao evento
ALTER TABLE eventos_admin ADD COLUMN IF NOT EXISTS subcategorias TEXT[] DEFAULT '{}';

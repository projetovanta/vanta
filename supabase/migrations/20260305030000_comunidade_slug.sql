-- Adiciona coluna slug em comunidades (para URLs amigáveis)
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_comunidades_slug ON comunidades (slug) WHERE slug IS NOT NULL;

-- Popular slugs existentes a partir do nome
-- Aplica lower() ANTES do regexp_replace para capturar maiúsculas
UPDATE comunidades SET slug =
  regexp_replace(
    regexp_replace(
      lower(translate(nome,
        'áàãâéèêíìîóòõôúùûçñÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇÑ',
        'aaaaeeeiiioooouuucnaaaaeeeiiioooouuucn')),
      '[^a-z0-9]+', '-', 'g'
    ),
    '^-|-$', '', 'g'
  )
WHERE slug IS NULL OR slug = '';

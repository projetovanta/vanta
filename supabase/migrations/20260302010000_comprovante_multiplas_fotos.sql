-- ══════════════════════════════════════════════════════════════════════════════
-- Comprovante Meia-Entrada: suportar múltiplos arquivos (frente/verso/extra)
-- Substitui foto_url (TEXT) por fotos (JSONB array)
-- Formato: [{"label":"frente","path":"userId/frente.jpg"}, {"label":"verso","path":"userId/verso.jpg"}]
-- Date: 2026-03-02 (incremental)
-- ══════════════════════════════════════════════════════════════════════════════

-- Adicionar coluna JSONB para múltiplas fotos
ALTER TABLE comprovantes_meia
  ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '[]'::jsonb;

-- Migrar dados existentes: foto_url → fotos array
UPDATE comprovantes_meia
  SET fotos = jsonb_build_array(jsonb_build_object('label', 'frente', 'path', foto_url))
  WHERE foto_url IS NOT NULL AND (fotos IS NULL OR fotos = '[]'::jsonb);

-- foto_url mantida para compatibilidade mas será deprecated
-- (não remover agora para não quebrar queries em produção)

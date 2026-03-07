-- Adiciona coluna 'area' na tabela regras_lista
-- Áreas: PISTA, CAMAROTE, AREA_VIP, BACKSTAGE, ou valor personalizado
ALTER TABLE regras_lista
  ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'PISTA';

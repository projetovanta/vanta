-- Adiciona coluna limites_por_tipo (JSONB) na tabela cortesias_config
-- Permite definir limites individuais por tipo de variação de cortesia
ALTER TABLE cortesias_config
ADD COLUMN IF NOT EXISTS limites_por_tipo JSONB DEFAULT NULL;

-- 10p: Coluna permissões customizadas para equipe_evento (ex: gerente)
ALTER TABLE equipe_evento ADD COLUMN IF NOT EXISTS permissoes TEXT[] DEFAULT '{}';

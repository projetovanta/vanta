-- Filtro personalizado para Próximos Eventos na Home
-- NULL = sem filtro (mostra todos os chips automáticos)
-- Array com valores = mostra só esses chips + "Todos"
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_filters text[] DEFAULT NULL;

COMMENT ON COLUMN profiles.home_filters IS 'Filtros personalizados do usuário para Próximos Eventos na Home. NULL = automático.';

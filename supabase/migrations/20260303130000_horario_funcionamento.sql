-- Horário de funcionamento de comunidades
ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS horario_funcionamento JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS horario_overrides     JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN comunidades.horario_funcionamento IS
  'Horário padrão semanal. Array de { dia: 0-6 (dom-sáb), aberto: bool, abertura: "HH:MM", fechamento: "HH:MM" }';
COMMENT ON COLUMN comunidades.horario_overrides IS
  'Exceções por data. Array de { data: "YYYY-MM-DD", aberto: bool, abertura?: "HH:MM", fechamento?: "HH:MM", motivo?: string }';
